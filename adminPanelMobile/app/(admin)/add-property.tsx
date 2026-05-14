/**
 * Add Property screen — multi-section form for creating a new property listing.
 *
 * Form sections (top to bottom):
 *   Basic Info → Address → Pricing → Features → Status & Visibility
 *   → Contact Info → Description → Photos
 *
 * Submit flow (two-step with optional-field warning):
 *   1. validate()         — marks required fields red if missing or out of range
 *   2. getEmptyOptionals() — lists optional fields that are blank; shows a
 *                            "Submit anyway?" confirmation modal before continuing
 *   3. doSubmit()         — builds FormData (needed for image upload) and calls
 *                           POST /admin/properties
 *
 * Image handling:
 *   - Picked from device gallery via expo-image-picker (multi-select)
 *   - Only JPEG, PNG, WEBP accepted; other formats are skipped with a warning
 *   - Images are appended to FormData as the `images[]` array field
 *
 * Reusable field components defined in this file:
 *   TextInputField, PickerField, ToggleGroup, SectionHeader, FieldLabel
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CustomSwitch } from '@/components/CustomSwitch';
import { Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminProperties } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Land', 'Unit', 'Villa', 'Acreage'];

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

const LISTING_TYPES = [
  { label: 'For Sale', value: 'buy' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Sold', value: 'sold' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Draft (Hidden)', value: 'inactive' },
  { label: 'Sold', value: 'sold' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function FieldLabel({ label, required, error }: { label: string; required?: boolean; error?: boolean }) {
  return (
    <Text style={[styles.fieldLabel, error && styles.fieldLabelError]}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function TextInputField({
  label, value, onChangeText, placeholder, required, multiline, keyboardType, maxLength, error,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; required?: boolean; multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'; maxLength?: number; error?: boolean;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} error={error} />
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        autoCapitalize="sentences"
        autoCorrect={false}
      />
    </View>
  );
}

function PickerField({
  label, value, options, onChange, required, placeholder, error,
}: {
  label: string; value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  required?: boolean; placeholder?: string; error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} error={error} />
      <TouchableOpacity style={[styles.pickerTrigger, error && styles.inputError]} onPress={() => setOpen(true)}>
        <Text style={[styles.pickerText, !current && styles.pickerPlaceholder]}>
          {current?.label ?? placeholder ?? 'Select…'}
        </Text>
        <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View style={styles.pickerDropdown}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={styles.pickerScroll}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pickerOption, opt.value === value && styles.pickerOptionActive]}
                onPress={() => { onChange(opt.value); setOpen(false); }}
              >
                <Text style={[styles.pickerOptionText, opt.value === value && styles.pickerOptionTextActive]}>
                  {opt.label}
                </Text>
                {opt.value === value && <Ionicons name="checkmark" size={15} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function ToggleGroup({
  label, options, value, onChange, required,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <View style={styles.toggleRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.toggleBtn, value === opt.value && styles.toggleBtnActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, value === opt.value && styles.toggleBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type ImageAsset = { uri: string; name: string; type: string };

type FormState = {
  title: string;
  listing_type: string;
  property_type: string;
  condition: string;
  category: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  price: string;
  price_per_week: string;
  beds: string;
  baths: string;
  cars: string;
  land_size: string;
  status: string;
  is_featured: boolean;
  agent_name: string;
  agency_name: string;
  description: string;
};

const defaultForm = (): FormState => ({
  title: '', listing_type: 'buy', property_type: 'House', condition: 'used',
  category: 'domestic', address: '', suburb: '', state: '', postcode: '',
  country: 'Sri Lanka', price: '', price_per_week: '', beds: '3', baths: '2',
  cars: '1', land_size: '', status: 'active', is_featured: false,
  agent_name: '', agency_name: '', description: '',
});

export default function AddPropertyScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>(defaultForm());
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [optionalWarning, setOptionalWarning] = useState<string[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);

  const set = (key: keyof FormState) => (val: string | boolean) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => { const next = new Set(prev); next.delete(key); return next; });
  };

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!res.canceled) {
      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const valid = res.assets.filter((a) => !a.mimeType || ALLOWED.includes(a.mimeType));
      const skipped = res.assets.length - valid.length;
      if (skipped > 0) toast.warning('Unsupported Format', `${skipped} file${skipped > 1 ? 's' : ''} skipped. Only JPG, PNG, and WEBP images are accepted.`);
      if (valid.length === 0) return;
      const picked: ImageAsset[] = valid.map((a) => {
        const ext = (a.fileName ?? a.uri).split('.').pop()?.toLowerCase() ?? 'jpg';
        const mime = a.mimeType ?? `image/${ext}`;
        return { uri: a.uri, name: a.fileName ?? `property.${ext}`, type: mime };
      });
      setImages((prev) => [...prev, ...picked]);
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!form.title.trim() || form.title.trim().length > 255) errs.add('title');
    if (!form.address.trim() || form.address.trim().length > 255) errs.add('address');
    if (!form.suburb.trim() || form.suburb.trim().length > 100) errs.add('suburb');
    if (!form.state) errs.add('state');
    const priceNum = Number(form.price.trim());
    if (!form.price.trim() || isNaN(priceNum) || priceNum < 0 || !Number.isInteger(priceNum)) errs.add('price');
    const bedsNum = Number(form.beds);
    if (isNaN(bedsNum) || bedsNum < 0 || bedsNum > 20 || !Number.isInteger(bedsNum)) errs.add('beds');
    const bathsNum = Number(form.baths);
    if (isNaN(bathsNum) || bathsNum < 0 || bathsNum > 20 || !Number.isInteger(bathsNum)) errs.add('baths');
    const carsNum = Number(form.cars);
    if (isNaN(carsNum) || carsNum < 0 || carsNum > 20 || !Number.isInteger(carsNum)) errs.add('cars');
    if (!form.description.trim()) errs.add('description');
    setErrors(errs);
    return errs.size === 0;
  };

  const getEmptyOptionals = (): string[] => {
    const missing: string[] = [];
    if (!form.postcode.trim()) missing.push('Postcode');
    if (form.listing_type === 'rent' && !form.price_per_week.trim()) missing.push('Price per Month');
    if (!form.land_size.trim()) missing.push('Land Size');
    if (!form.agent_name.trim()) missing.push('Agent Name');
    if (!form.agency_name.trim()) missing.push('Agency Name');
    if (images.length === 0) missing.push('Photos');
    return missing;
  };

  const doSubmit = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const fd = new FormData();
      const append = (k: string, v: string) => { if (v) fd.append(k, v); };

      append('title', form.title.trim());
      append('listing_type', form.listing_type);
      append('property_type', form.property_type);
      append('condition', form.condition);
      append('category', form.category);
      append('address', form.address.trim());
      append('suburb', form.suburb.trim());
      append('state', form.state);
      append('postcode', form.postcode.trim());
      append('country', form.country.trim() || 'Sri Lanka');
      append('price', form.price);
      if (form.listing_type === 'rent') append('price_per_week', form.price_per_week);
      append('beds', form.beds);
      append('baths', form.baths);
      append('cars', form.cars);
      append('land_size', form.land_size.trim());
      append('status', form.status);
      fd.append('is_featured', form.is_featured ? '1' : '0');
      append('agent_name', form.agent_name.trim());
      append('agency_name', form.agency_name.trim());
      append('description', form.description.trim());

      images.forEach((img) => {
        fd.append('images[]', { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
      });

      await adminProperties.create(token, fd);
      toast.success('Property Created', 'Property created successfully!');
      router.back();
    } catch (err: unknown) {
      toast.error('Create Failed', friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm());
    setImages([]);
    setErrors(new Set());
    setOptionalWarning([]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const missing = getEmptyOptionals();
    if (missing.length > 0) { setOptionalWarning(missing); return; }
    doSubmit();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        // keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 102 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Basic Info ── */}
          <SectionHeader title="Basic Information" />
          <View style={styles.card}>
            <TextInputField
              label="Property Title" value={form.title}
              onChangeText={set('title')} required
              placeholder="e.g. Charming 3BR Family Home in Colombo"
              error={errors.has('title')}
            />
            <PickerField
              label="Listing Type" value={form.listing_type}
              options={LISTING_TYPES} onChange={set('listing_type')} required
            />
            <PickerField
              label="Property Type" value={form.property_type}
              options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))}
              onChange={set('property_type')} required
            />
            <ToggleGroup
              label="Condition" required
              options={[{ label: 'New', value: 'new' }, { label: 'Used', value: 'used' }]}
              value={form.condition} onChange={set('condition')}
            />
            <ToggleGroup
              label="Category" required
              options={[
                { label: 'Domestic', value: 'domestic' },
                { label: 'Commercial', value: 'commercial' },
                { label: 'Both', value: 'both' },
              ]}
              value={form.category} onChange={set('category')}
            />
          </View>

          {/* ── Address ── */}
          <SectionHeader title="Address" />
          <View style={styles.card}>
            <TextInputField
              label="Street Address" value={form.address}
              onChangeText={set('address')} required
              placeholder="e.g. 12 Oak Street"
              error={errors.has('address')}
            />
            <TextInputField
              label="City" value={form.suburb}
              onChangeText={set('suburb')} required
              placeholder="e.g. Colombo"
              error={errors.has('suburb')}
            />
            <PickerField
              label="District" value={form.state}
              options={DISTRICTS.map((d) => ({ label: d, value: d }))}
              onChange={set('state')} required placeholder="Select district"
              error={errors.has('state')}
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <TextInputField
                  label="Postcode" value={form.postcode}
                  onChangeText={set('postcode')} placeholder="e.g. 10100"
                  maxLength={10}
                />
              </View>
              <View style={styles.half}>
                <TextInputField
                  label="Country" value={form.country}
                  onChangeText={set('country')} placeholder="Sri Lanka"
                />
              </View>
            </View>
          </View>

          {/* ── Pricing ── */}
          <SectionHeader title="Pricing" />
          <View style={styles.card}>
            <TextInputField
              label="Price (LKR)" value={form.price}
              onChangeText={set('price')} required keyboardType="numeric"
              placeholder="e.g. 15000000"
              error={errors.has('price')}
            />
            {form.listing_type === 'rent' && (
              <TextInputField
                label="Price per Month (LKR)" value={form.price_per_week}
                onChangeText={set('price_per_week')} keyboardType="numeric"
                placeholder="e.g. 50000"
              />
            )}
          </View>

          {/* ── Features ── */}
          <SectionHeader title="Features" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.third}>
                <TextInputField label="Beds" value={form.beds} onChangeText={set('beds')} keyboardType="numeric" required error={errors.has('beds')} />
              </View>
              <View style={styles.third}>
                <TextInputField label="Baths" value={form.baths} onChangeText={set('baths')} keyboardType="numeric" required error={errors.has('baths')} />
              </View>
              <View style={styles.third}>
                <TextInputField label="Car Spaces" value={form.cars} onChangeText={set('cars')} keyboardType="numeric" required error={errors.has('cars')} />
              </View>
            </View>
            <TextInputField
              label="Land Size" value={form.land_size}
              onChangeText={set('land_size')} placeholder="e.g. 500 sqm"
            />
          </View>

          {/* ── Status & Visibility ── */}
          <SectionHeader title="Status & Visibility" />
          <View style={styles.card}>
            <PickerField
              label="Status" value={form.status}
              options={STATUS_OPTIONS} onChange={set('status')}
            />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Feature on Homepage</Text>
                <Text style={styles.switchSub}>Show in featured listings</Text>
              </View>
              <CustomSwitch
                value={form.is_featured}
                onValueChange={(v) => set('is_featured')(v)}
                size="md"
              />
            </View>
          </View>

          {/* ── Contact Info ── */}
          <SectionHeader title="Contact Information" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.half}>
                <TextInputField
                  label="Agent Name (optional)" value={form.agent_name}
                  onChangeText={set('agent_name')} placeholder="e.g. John Silva"
                />
              </View>
              <View style={styles.half}>
                <TextInputField
                  label="Agency Name (optional)" value={form.agency_name}
                  onChangeText={set('agency_name')} placeholder="e.g. GreenBrick Realty"
                />
              </View>
            </View>
          </View>

          {/* ── Description ── */}
          <SectionHeader title="Description" />
          <View style={styles.card}>
            <TextInputField
              label="Property Description" value={form.description}
              onChangeText={set('description')} required multiline
              placeholder="Describe the property in detail..."
              error={errors.has('description')}
            />
          </View>

          {/* ── Photos ── */}
          <SectionHeader title="Photos" />
          <View style={styles.card}>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
              <Ionicons name="images-outline" size={22} color={Colors.primary} />
              <Text style={styles.imagePickerText}>
                {images.length > 0 ? `${images.length} photo${images.length !== 1 ? 's' : ''} selected — tap to add more` : 'Tap to select photos'}
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.imageThumbWrap}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                    <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ── Actions ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => setResetConfirm(true)}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Create Property</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={optionalWarning.length > 0}
        title="Some fields are empty"
        message={`These optional fields are empty:\n• ${optionalWarning.join('\n• ')}\n\nSubmit anyway?`}
        confirmLabel="Submit"
        confirmColor={Colors.primary}
        onConfirm={() => { setOptionalWarning([]); doSubmit(); }}
        onCancel={() => setOptionalWarning([])}
      />
      <ConfirmModal
        visible={resetConfirm}
        title="Reset Form"
        message="All entered data and selected photos will be cleared. Continue?"
        confirmLabel="Reset"
        confirmColor={Colors.danger}
        onConfirm={() => { setResetConfirm(false); handleReset(); }}
        onCancel={() => setResetConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.card },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4, gap: 8 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 2,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 14,
  },

  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldLabelError: { color: Colors.danger },
  required: { color: Colors.danger },
  inputError: { borderColor: Colors.danger },

  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 11,
  },

  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pickerText: { fontSize: 14, color: Colors.text, flex: 1 },
  pickerPlaceholder: { color: Colors.textLight },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    marginTop: 2,
  },
  pickerScroll: { maxHeight: 180 },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  pickerOptionActive: { backgroundColor: Colors.primaryLight },
  pickerOptionText: { fontSize: 14, color: Colors.text },
  pickerOptionTextActive: { color: Colors.primary, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleBtnTextActive: { color: '#fff' },

  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  third: { flex: 1 },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  switchSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    backgroundColor: Colors.primaryLight,
  },
  imagePickerText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  imageRow: { marginTop: 4 },
  imageThumbWrap: { position: 'relative', marginRight: 10 },
  imageThumb: { width: 80, height: 80, borderRadius: 10, resizeMode: 'cover' },
  imageRemove: { position: 'absolute', top: -6, right: -6 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 20,
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 54,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
