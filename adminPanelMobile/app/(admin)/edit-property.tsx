/**
 * Edit Property screen — pre-filled form for updating an existing listing.
 *
 * Navigation: properties.tsx navigates here with `router.push('/(admin)/edit-property?id=<id>')`.
 * The property ID is read from the `id` URL search param via useLocalSearchParams().
 *
 * On mount, loads the full property via GET /properties/:id to pre-fill all fields.
 *
 * Actions available:
 *   - Save changes  → PATCH /admin/properties/:id (only changed fields are sent)
 *   - Add images    → POST /properties/:id/images
 *   - Delete image  → DELETE /properties/:id/images/:imageId
 *   - Delete listing → DELETE /admin/properties/:id (with confirmation modal)
 *
 * Uses the same reusable field components (InputField, PickerField, ToggleGroup)
 * defined locally in this file, mirroring add-property.tsx.
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CustomSwitch } from '@/components/CustomSwitch';
import { Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminProperties } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Property, PropertyImage } from '@/lib/types';

// ─── Constants (shared with add-property) ─────────────────────────────────────

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

// ─── Reusable field components ─────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function FieldLabel({ label, required, error }: { label: string; required?: boolean; error?: boolean }) {
  return (
    <Text style={[styles.fieldLabel, error && styles.fieldLabelError]}>
      {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function InputField({
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
      <TouchableOpacity style={[styles.pickerTrigger, error && styles.inputError]} onPress={() => setOpen((v) => !v)}>
        <Text style={[styles.pickerText, !current && styles.pickerPlaceholder]}>
          {current?.label ?? placeholder ?? 'Select…'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.textMuted} />
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
  label: string; options: { label: string; value: string }[];
  value: string; onChange: (v: string) => void; required?: boolean;
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

// ─── Main screen ──────────────────────────────────────────────────────────────

type NewImage = { uri: string; name: string; type: string };

export default function EditPropertyScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState('buy');
  const [propertyType, setPropertyType] = useState('House');
  const [condition, setCondition] = useState('used');
  const [category, setCategory] = useState('domestic');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [price, setPrice] = useState('');
  const [pricePerWeek, setPricePerWeek] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [cars, setCars] = useState('');
  const [landSize, setLandSize] = useState('');
  const [status, setStatus] = useState('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [description, setDescription] = useState('');

  // Images
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [optionalWarning, setOptionalWarning] = useState<string[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Fetch property on mount
  useEffect(() => {
    if (!token || !id) return;
    adminProperties.get(token, Number(id))
      .then((p) => {
        setProperty(p);
        setTitle(p.title);
        setListingType(p.listing_type);
        setPropertyType(p.property_type);
        setCondition(p.condition);
        setCategory(p.category);
        setAddress(p.address);
        setSuburb(p.suburb);
        setState(p.state);
        setPostcode(p.postcode ?? '');
        setCountry(p.country ?? 'Sri Lanka');
        setPrice(String(p.price));
        setPricePerWeek(p.price_per_week ? String(p.price_per_week) : '');
        setBeds(String(p.beds));
        setBaths(String(p.baths));
        setCars(String(p.cars));
        setLandSize(p.land_size ?? '');
        setStatus(p.status);
        setIsFeatured(p.is_featured);
        setAgentName(p.agent_name ?? '');
        setAgencyName(p.agency_name ?? '');
        setDescription(p.description);
        setExistingImages(p.images ?? []);
      })
      .catch((err) => toast.error('Failed to Load Property', friendlyError(err)))
      .finally(() => setFetchLoading(false));
  }, [token, id]);

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
      const picked: NewImage[] = valid.map((a) => {
        const ext = (a.fileName ?? a.uri).split('.').pop()?.toLowerCase() ?? 'jpg';
        const mime = a.mimeType ?? `image/${ext}`;
        return { uri: a.uri, name: a.fileName ?? `property.${ext}`, type: mime };
      });
      setNewImages((prev) => [...prev, ...picked]);
    }
  };

  const removeExistingImage = (imgId: number) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
    setRemovedImageIds((prev) => [...prev, imgId]);
  };

  const removeNewImage = (idx: number) =>
    setNewImages((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!title.trim()) errs.add('title');
    if (!address.trim()) errs.add('address');
    if (!suburb.trim()) errs.add('suburb');
    if (!state) errs.add('state');
    if (!price || isNaN(Number(price))) errs.add('price');
    if (!description.trim()) errs.add('description');
    setErrors(errs);
    return errs.size === 0;
  };

  const getEmptyOptionals = (): string[] => {
    const missing: string[] = [];
    if (!postcode.trim()) missing.push('Postcode');
    if (listingType === 'rent' && !pricePerWeek.trim()) missing.push('Price per Month');
    if (!landSize.trim()) missing.push('Land Size');
    if (!agentName.trim()) missing.push('Agent Name');
    if (!agencyName.trim()) missing.push('Agency Name');
    if (existingImages.length === 0 && newImages.length === 0) missing.push('Photos');
    return missing;
  };

  const doSubmit = async () => {
    if (!token || !id) return;

    setSaving(true);
    try {
      const fd = new FormData();
      const append = (k: string, v: string) => { if (v) fd.append(k, v); };

      append('title', title.trim());
      append('listing_type', listingType);
      append('property_type', propertyType);
      append('condition', condition);
      append('category', category);
      append('address', address.trim());
      append('suburb', suburb.trim());
      append('state', state);
      append('postcode', postcode.trim());
      append('country', country.trim() || 'Sri Lanka');
      append('price', price);
      if (listingType === 'rent') append('price_per_week', pricePerWeek);
      append('beds', beds);
      append('baths', baths);
      append('cars', cars);
      append('land_size', landSize.trim());
      append('status', status);
      fd.append('is_featured', isFeatured ? '1' : '0');
      append('agent_name', agentName.trim());
      append('agency_name', agencyName.trim());
      append('description', description.trim());

      removedImageIds.forEach((imgId) => fd.append('remove_images[]', String(imgId)));

      newImages.forEach((img) => {
        fd.append('images[]', { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
      });

      await adminProperties.update(token, Number(id), fd as unknown as Partial<Property>);
      toast.success('Property Updated', 'Property updated successfully!');
      router.back();
    } catch (err: unknown) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!property) return;
    setTitle(property.title);
    setListingType(property.listing_type);
    setPropertyType(property.property_type);
    setCondition(property.condition);
    setCategory(property.category);
    setAddress(property.address);
    setSuburb(property.suburb);
    setState(property.state);
    setPostcode(property.postcode ?? '');
    setCountry(property.country ?? 'Sri Lanka');
    setPrice(String(property.price));
    setPricePerWeek(property.price_per_week ? String(property.price_per_week) : '');
    setBeds(String(property.beds));
    setBaths(String(property.baths));
    setCars(String(property.cars));
    setLandSize(property.land_size ?? '');
    setStatus(property.status);
    setIsFeatured(property.is_featured);
    setAgentName(property.agent_name ?? '');
    setAgencyName(property.agency_name ?? '');
    setDescription(property.description);
    setExistingImages(property.images ?? []);
    setRemovedImageIds([]);
    setNewImages([]);
    setErrors(new Set());
    setOptionalWarning([]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const missing = getEmptyOptionals();
    if (missing.length > 0) { setOptionalWarning(missing); return; }
    doSubmit();
  };

  if (fetchLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading property…</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={40} color={Colors.textLight} />
        <Text style={styles.loadingText}>Property not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Basic Info ── */}
          <SectionHeader title="Basic Information" />
          <View style={styles.card}>
            <InputField label="Property Title" value={title} onChangeText={(v) => { setTitle(v); setErrors((p) => { const n = new Set(p); n.delete('title'); return n; }); }} required placeholder="e.g. Charming 3BR Family Home" error={errors.has('title')} />
            <PickerField label="Listing Type" value={listingType} options={LISTING_TYPES} onChange={setListingType} required />
            <PickerField label="Property Type" value={propertyType} options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))} onChange={setPropertyType} required />
            <ToggleGroup label="Condition" required options={[{ label: 'New', value: 'new' }, { label: 'Used', value: 'used' }]} value={condition} onChange={setCondition} />
            <ToggleGroup label="Category" required options={[{ label: 'Domestic', value: 'domestic' }, { label: 'Commercial', value: 'commercial' }, { label: 'Both', value: 'both' }]} value={category} onChange={setCategory} />
          </View>

          {/* ── Address ── */}
          <SectionHeader title="Address" />
          <View style={styles.card}>
            <InputField label="Street Address" value={address} onChangeText={(v) => { setAddress(v); setErrors((p) => { const n = new Set(p); n.delete('address'); return n; }); }} required placeholder="e.g. 12 Oak Street" error={errors.has('address')} />
            <InputField label="City" value={suburb} onChangeText={(v) => { setSuburb(v); setErrors((p) => { const n = new Set(p); n.delete('suburb'); return n; }); }} required placeholder="e.g. Colombo" error={errors.has('suburb')} />
            <PickerField label="District" value={state} options={DISTRICTS.map((d) => ({ label: d, value: d }))} onChange={(v) => { setState(v); setErrors((p) => { const n = new Set(p); n.delete('state'); return n; }); }} required placeholder="Select district" error={errors.has('state')} />
            <View style={styles.row}>
              <View style={styles.half}><InputField label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="e.g. 10100" maxLength={10} /></View>
              <View style={styles.half}><InputField label="Country" value={country} onChangeText={setCountry} placeholder="Sri Lanka" /></View>
            </View>
          </View>

          {/* ── Pricing ── */}
          <SectionHeader title="Pricing" />
          <View style={styles.card}>
            <InputField label="Price (LKR)" value={price} onChangeText={(v) => { setPrice(v); setErrors((p) => { const n = new Set(p); n.delete('price'); return n; }); }} required keyboardType="numeric" placeholder="e.g. 15000000" error={errors.has('price')} />
            {listingType === 'rent' && (
              <InputField label="Price per Month (LKR)" value={pricePerWeek} onChangeText={setPricePerWeek} keyboardType="numeric" placeholder="e.g. 50000" />
            )}
          </View>

          {/* ── Features ── */}
          <SectionHeader title="Features" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.third}><InputField label="Beds" value={beds} onChangeText={setBeds} keyboardType="numeric" required /></View>
              <View style={styles.third}><InputField label="Baths" value={baths} onChangeText={setBaths} keyboardType="numeric" required /></View>
              <View style={styles.third}><InputField label="Car Spaces" value={cars} onChangeText={setCars} keyboardType="numeric" required /></View>
            </View>
            <InputField label="Land Size" value={landSize} onChangeText={setLandSize} placeholder="e.g. 500 sqm" />
          </View>

          {/* ── Status & Visibility ── */}
          <SectionHeader title="Status & Visibility" />
          <View style={styles.card}>
            <PickerField label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Feature on Homepage</Text>
                <Text style={styles.switchSub}>Show in featured listings</Text>
              </View>
              <CustomSwitch
                value={isFeatured}
                onValueChange={setIsFeatured}
                size="md"
              />
            </View>
          </View>

          {/* ── Contact Info ── */}
          <SectionHeader title="Contact Information" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.half}><InputField label="Agent Name (optional)" value={agentName} onChangeText={setAgentName} placeholder="e.g. John Silva" /></View>
              <View style={styles.half}><InputField label="Agency Name (optional)" value={agencyName} onChangeText={setAgencyName} placeholder="e.g. GreenBrick Realty" /></View>
            </View>
          </View>

          {/* ── Description ── */}
          <SectionHeader title="Description" />
          <View style={styles.card}>
            <InputField label="Property Description" value={description} onChangeText={(v) => { setDescription(v); setErrors((p) => { const n = new Set(p); n.delete('description'); return n; }); }} required multiline placeholder="Describe the property in detail..." error={errors.has('description')} />
          </View>

          {/* ── Photos ── */}
          <SectionHeader title="Photos" />
          <View style={styles.card}>
            {/* Existing images */}
            {existingImages.length > 0 && (
              <View>
                <Text style={styles.imgSectionLabel}>Current photos — tap × to remove</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                  {existingImages.map((img) => (
                    <View key={img.id} style={styles.imageThumbWrap}>
                      <Image source={{ uri: img.url }} style={styles.imageThumb} />
                      {img.is_primary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Main</Text>
                        </View>
                      )}
                      <TouchableOpacity style={styles.imageRemove} onPress={() => removeExistingImage(img.id)}>
                        <Ionicons name="close-circle" size={20} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Add new images */}
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
              <Ionicons name="images-outline" size={22} color={Colors.primary} />
              <Text style={styles.imagePickerText}>
                {newImages.length > 0 ? `${newImages.length} new photo${newImages.length !== 1 ? 's' : ''} — tap to add more` : 'Tap to add more photos'}
              </Text>
            </TouchableOpacity>

            {newImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {newImages.map((img, idx) => (
                  <View key={idx} style={styles.imageThumbWrap}>
                    <Image source={{ uri: img.uri }} style={[styles.imageThumb, styles.imageThumbNew]} />
                    <TouchableOpacity style={styles.imageRemove} onPress={() => removeNewImage(idx)}>
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
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Save Changes</Text>
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
        message="All changes will be reverted to the original property values."
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.background },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 48, gap: 8 },

  sectionHeader: { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8, marginBottom: 2, paddingHorizontal: 2 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 14 },

  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldLabelError: { color: Colors.danger },
  required: { color: Colors.danger },
  inputError: { borderColor: Colors.danger },

  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: Colors.text },
  inputMultiline: { minHeight: 96, paddingTop: 11 },

  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  pickerText: { fontSize: 14, color: Colors.text, flex: 1 },
  pickerPlaceholder: { color: Colors.textLight },
  pickerDropdown: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.card, overflow: 'hidden', marginTop: 2 },
  pickerScroll: { maxHeight: 180 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  pickerOptionActive: { backgroundColor: Colors.primaryLight },
  pickerOptionText: { fontSize: 14, color: Colors.text },
  pickerOptionTextActive: { color: Colors.primary, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleBtnTextActive: { color: '#fff' },

  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  third: { flex: 1 },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  switchSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  imgSectionLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  imageRow: { marginVertical: 4 },
  imageThumbWrap: { position: 'relative', marginRight: 10 },
  imageThumb: { width: 80, height: 80, borderRadius: 10, resizeMode: 'cover' },
  imageThumbNew: { borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed' },
  primaryBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: Colors.primary, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  primaryBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  imageRemove: { position: 'absolute', top: -6, right: -6 },

  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: 12, paddingVertical: 18, backgroundColor: Colors.primaryLight },
  imagePickerText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 16, minHeight: 54, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 20 },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, minHeight: 54 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
