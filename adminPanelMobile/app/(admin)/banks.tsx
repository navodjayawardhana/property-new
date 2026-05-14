/**
 * Bank Loan Rates management screen.
 *
 * Displays all bank loan products fetched from GET /admin/bank-loan-rates.
 * Each card shows: bank logo, loan type badge, interest rate, max term,
 * min/max loan amounts, feature tags, and an active/inactive toggle.
 *
 * Create / Edit via a full-screen modal (React Native Modal):
 *   - Fields: bank name, loan type, interest rate (%), max term (years),
 *             min/max loan (LKR), feature list (comma-separated), sort order,
 *             active toggle, optional logo image
 *   - Logo picked via expo-image-picker (square crop, JPEG/PNG/WEBP only)
 *   - POST /admin/bank-loan-rates to create, PUT /admin/bank-loan-rates/:id to update
 *
 * sort_order controls the display order on the public-facing finance page (lower = first).
 *
 * Per-card actions:
 *   - Toggle active/inactive inline (no modal needed)
 *   - Edit → opens the modal pre-filled
 *   - Delete → DELETE /admin/bank-loan-rates/:id (with confirmation modal)
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/Badge';
import { CustomSwitch } from '@/components/CustomSwitch';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { ScreenLoader } from '@/components/ScreenLoader';
import { BadgeColors, Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminBanks } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BankLoanRate } from '@/lib/types';

const LOAN_TYPES = [
  { label: 'Variable Rate', value: 'variable' },
  { label: 'Fixed Rate', value: 'fixed' },
  { label: 'Split Loan', value: 'split' },
  { label: 'Interest Only', value: 'interest_only' },
];

type BankForm = {
  bank_name: string;
  loan_type: BankLoanRate['loan_type'];
  interest_rate: string;
  max_term: string;
  min_loan: string;
  max_loan: string;
  sort_order: string;
  is_active: boolean;
  features: string;
  logoUri: string | null;
};

const emptyForm = (): BankForm => ({
  bank_name: '', loan_type: 'variable', interest_rate: '', max_term: '', min_loan: '', max_loan: '', sort_order: '0', is_active: true, features: '', logoUri: null,
});

export default function BanksScreen() {
  const { token } = useAuth();
  const [banks, setBanks] = useState<BankLoanRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankLoanRate | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<BankLoanRate | null>(null);
  const [form, setForm] = useState<BankForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Set<string>>(new Set());
  const [optionalWarning, setOptionalWarning] = useState<string[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminBanks.list(token);
      setBanks(data);
    } catch (err) {
      toast.error('Failed to Load Bank Rates', friendlyError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors(new Set());
    setOptionalWarning([]);
    setModalVisible(true);
  };

  const openEdit = (b: BankLoanRate) => {
    setEditTarget(b);
    setForm({
      bank_name: b.bank_name,
      loan_type: b.loan_type,
      interest_rate: String(b.interest_rate),
      max_term: String(b.max_term),
      min_loan: String(b.min_loan),
      max_loan: String(b.max_loan),
      sort_order: String(b.sort_order),
      is_active: b.is_active,
      features: (b.features ?? []).join(', '),
      logoUri: null,
    });
    setFormErrors(new Set());
    setOptionalWarning([]);
    setModalVisible(true);
  };

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (asset.mimeType && !ALLOWED.includes(asset.mimeType)) {
        toast.warning('Unsupported Format', 'Only JPG, PNG, and WEBP images are accepted.');
        return;
      }
      setForm((f) => ({ ...f, logoUri: asset.uri }));
    }
  };

  const doSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('bank_name', form.bank_name.trim());
      fd.append('loan_type', form.loan_type);
      fd.append('interest_rate', form.interest_rate);
      fd.append('max_term', form.max_term || '30');
      fd.append('min_loan', form.min_loan || '0');
      fd.append('max_loan', form.max_loan || '0');
      fd.append('sort_order', form.sort_order || '0');
      fd.append('is_active', form.is_active ? '1' : '0');
      if (form.features.trim()) fd.append('features', form.features.trim());
      if (form.logoUri) {
        const ext = form.logoUri.split('.').pop() ?? 'jpg';
        fd.append('logo', { uri: form.logoUri, name: `logo.${ext}`, type: `image/${ext}` } as unknown as Blob);
      }

      if (editTarget) {
        const updated = await adminBanks.update(token, editTarget.id, fd);
        setBanks((prev) => prev.map((b) => (b.id === editTarget.id ? updated : b)));
      } else {
        const created = await adminBanks.create(token, fd);
        setBanks((prev) => [created, ...prev]);
      }
      setModalVisible(false);
    } catch (err) {
      toast.error('Save Failed', friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm());
    setFormErrors(new Set());
    setOptionalWarning([]);
  };

  const handleSave = () => {
    const errs = new Set<string>();
    if (!form.bank_name.trim() || form.bank_name.trim().length > 255) errs.add('bank_name');
    const rateNum = parseFloat(form.interest_rate);
    if (!form.interest_rate.trim() || isNaN(rateNum) || rateNum < 0 || rateNum > 100) errs.add('interest_rate');
    setFormErrors(errs);
    if (errs.size > 0) return;

    if (form.max_term.trim()) {
      const mt = parseInt(form.max_term, 10);
      if (isNaN(mt) || mt < 1 || mt > 30) {
        toast.warning('Validation', 'Max term must be a whole number between 1 and 30 years.');
        return;
      }
    }
    if (form.min_loan.trim()) {
      const ml = parseInt(form.min_loan, 10);
      if (isNaN(ml) || ml < 0) {
        toast.warning('Validation', 'Min loan must be a valid non-negative amount.');
        return;
      }
    }
    if (form.max_loan.trim()) {
      const xl = parseInt(form.max_loan, 10);
      if (isNaN(xl) || xl < 0) {
        toast.warning('Validation', 'Max loan must be a valid non-negative amount.');
        return;
      }
    }

    const missing: string[] = [];
    const hasLogo = !!form.logoUri || !!editTarget?.logo_url;
    if (!hasLogo) missing.push('Bank Logo');
    if (!form.max_term.trim()) missing.push('Max Term');
    if (!form.min_loan.trim()) missing.push('Min Loan');
    if (!form.max_loan.trim()) missing.push('Max Loan');
    if (!form.features.trim()) missing.push('Features');
    if (missing.length > 0) { setOptionalWarning(missing); return; }
    doSave();
  };

  const handleToggleActive = async (bank: BankLoanRate) => {
    if (!token) return;
    setTogglingId(bank.id);
    try {
      const fd = new FormData();
      fd.append('is_active', bank.is_active ? '0' : '1');
      fd.append('bank_name', bank.bank_name);
      fd.append('loan_type', bank.loan_type);
      fd.append('interest_rate', String(bank.interest_rate));
      fd.append('max_term', String(bank.max_term));
      fd.append('min_loan', String(bank.min_loan));
      fd.append('max_loan', String(bank.max_loan));
      const updated = await adminBanks.update(token, bank.id, fd);
      setBanks((prev) => prev.map((b) => (b.id === bank.id ? updated : b)));
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminBanks.delete(token, deleteTarget.id);
      setBanks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const loanTypeLabel = (t: BankLoanRate['loan_type']) => LOAN_TYPES.find((x) => x.value === t)?.label ?? t;

  const renderItem = ({ item }: { item: BankLoanRate }) => {
    const tc = BadgeColors.loanType[item.loan_type] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const isToggling = togglingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          {item.logo_url ? (
            <Image source={{ uri: item.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="business-outline" size={20} color={Colors.textLight} />
            </View>
          )}
          <View style={styles.bankInfo}>
            <Text style={styles.bankName}>{item.bank_name}</Text>
            <Badge label={loanTypeLabel(item.loan_type)} bg={tc.bg} color={tc.text} />
          </View>
          <View style={[styles.activeDot, { backgroundColor: item.is_active ? Colors.primary : Colors.gray300 }]} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rate</Text>
            <Text style={styles.statVal}>{item.interest_rate}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Term</Text>
            <Text style={styles.statVal}>{item.max_term}yr</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min Loan</Text>
            <Text style={styles.statVal}>LKR {(item.min_loan / 1000000).toFixed(0)}M</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Loan</Text>
            <Text style={styles.statVal}>LKR {(item.max_loan / 1000000).toFixed(0)}M</Text>
          </View>
        </View>

        {item.features && item.features.length > 0 && (
          <Text style={styles.features} numberOfLines={1}>
            {item.features.join(' · ')}
          </Text>
        )}

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          {isToggling ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{item.is_active ? 'Active' : 'Inactive'}</Text>
              <CustomSwitch
                value={item.is_active}
                onValueChange={() => handleToggleActive(item)}
                size="sm"
              />
            </View>
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
              <Ionicons name="pencil-outline" size={15} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={15} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarRow}>
          <Text style={styles.countText}>{banks.length} bank{banks.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Bank</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ScreenLoader message="Loading bank rates…" />
      ) : (
        <FlatList
          data={banks}
          keyExtractor={(b) => String(b.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="business-outline" title="No bank rates added" subtitle="Add your first bank loan rate" />}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetIconBtn} onPress={() => setResetConfirm(true)}>
                  <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{editTarget ? 'Edit Bank' : 'Add Bank'}</Text>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Logo */}
              <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
                {form.logoUri ? (
                  <Image source={{ uri: form.logoUri }} style={styles.logoPickerImg} />
                ) : editTarget?.logo_url ? (
                  <Image source={{ uri: editTarget.logo_url }} style={styles.logoPickerImg} />
                ) : (
                  <View style={styles.logoPickerPlaceholder}>
                    <Ionicons name="image-outline" size={28} color={Colors.textLight} />
                    <Text style={styles.logoPickerText}>Logo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, formErrors.has('bank_name') && styles.fieldLabelError]}>Bank Name *</Text>
                <TextInput style={[styles.input, formErrors.has('bank_name') && styles.inputError]} value={form.bank_name} onChangeText={(t) => { setForm((f) => ({ ...f, bank_name: t })); setFormErrors((p) => { const n = new Set(p); n.delete('bank_name'); return n; }); }} placeholder="e.g. Commercial Bank" placeholderTextColor={Colors.textLight} />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Loan Type</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setTypePickerOpen(true)}>
                  <Text style={styles.selectText}>{loanTypeLabel(form.loan_type)}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, formErrors.has('interest_rate') && styles.fieldLabelError]}>Interest Rate (%)</Text>
                  <TextInput style={[styles.input, formErrors.has('interest_rate') && styles.inputError]} value={form.interest_rate} onChangeText={(t) => { setForm((f) => ({ ...f, interest_rate: t })); setFormErrors((p) => { const n = new Set(p); n.delete('interest_rate'); return n; }); }} placeholder="e.g. 12.5" placeholderTextColor={Colors.textLight} keyboardType="decimal-pad" />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Max Term (yrs)</Text>
                  <TextInput style={styles.input} value={form.max_term} onChangeText={(t) => setForm((f) => ({ ...f, max_term: t }))} placeholder="30" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Min Loan (LKR)</Text>
                  <TextInput style={styles.input} value={form.min_loan} onChangeText={(t) => setForm((f) => ({ ...f, min_loan: t }))} placeholder="1000000" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Max Loan (LKR)</Text>
                  <TextInput style={styles.input} value={form.max_loan} onChangeText={(t) => setForm((f) => ({ ...f, max_loan: t }))} placeholder="50000000" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Features (comma-separated)</Text>
                <TextInput style={styles.input} value={form.features} onChangeText={(t) => setForm((f) => ({ ...f, features: t }))} placeholder="Low rate, Flexible, No fees" placeholderTextColor={Colors.textLight} />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 2 }]}>
                  <Text style={styles.fieldLabel}>Sort Order</Text>
                  <TextInput style={styles.input} value={form.sort_order} onChangeText={(t) => setForm((f) => ({ ...f, sort_order: t }))} placeholder="0" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
                </View>
                <View style={styles.activeRow}>
                  <Text style={styles.fieldLabel}>Active</Text>
                  <CustomSwitch
                    value={form.is_active}
                    onValueChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                    size="md"
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Type picker */}
        <Modal visible={typePickerOpen} transparent animationType="fade" onRequestClose={() => setTypePickerOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setTypePickerOpen(false)}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.pickerMenu}>
                  <Text style={styles.pickerTitle}>Select Loan Type</Text>
                  {LOAN_TYPES.map((lt) => (
                    <TouchableOpacity key={lt.value} style={[styles.pickerOption, form.loan_type === lt.value && styles.pickerOptionActive]} onPress={() => { setForm((f) => ({ ...f, loan_type: lt.value as BankLoanRate['loan_type'] })); setTypePickerOpen(false); }}>
                      <Text style={[styles.pickerText, form.loan_type === lt.value && styles.pickerTextActive]}>{lt.label}</Text>
                      {form.loan_type === lt.value && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Bank Rate"
        message={`Delete "${deleteTarget?.bank_name}"? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        visible={optionalWarning.length > 0}
        title="Some fields are empty"
        message={`These optional fields are empty:\n• ${optionalWarning.join('\n• ')}\n\nSubmit anyway?`}
        confirmLabel="Submit"
        confirmColor={Colors.primary}
        onConfirm={() => { setOptionalWarning([]); doSave(); }}
        onCancel={() => setOptionalWarning([])}
      />
      <ConfirmModal
        visible={resetConfirm}
        title="Reset Form"
        message="All entered data will be cleared. Continue?"
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
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 10 },
  logo: { width: 46, height: 46, borderRadius: 10, resizeMode: 'contain', backgroundColor: Colors.gray50 },
  logoPlaceholder: { width: 46, height: 46, borderRadius: 10, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  bankInfo: { flex: 1, gap: 4 },
  bankName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 10 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 2 },
  statLabel: { fontSize: 10, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  statVal: { fontSize: 12, fontWeight: '700', color: Colors.text },
  features: { fontSize: 11, color: Colors.textMuted, paddingHorizontal: 14, paddingBottom: 10 },
  cardDivider: { height: 1, backgroundColor: Colors.borderLight },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  btnRow: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resetIconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray100 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.primary, minWidth: 64, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  modalContent: { padding: 16, gap: 14, paddingBottom: 32 },
  logoPicker: { alignSelf: 'center', marginBottom: 4 },
  logoPickerImg: { width: 80, height: 80, borderRadius: 16, resizeMode: 'contain', backgroundColor: Colors.gray50 },
  logoPickerPlaceholder: { width: 80, height: 80, borderRadius: 16, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border },
  logoPickerText: { fontSize: 11, color: Colors.textLight },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldLabelError: { color: Colors.danger },
  inputError: { borderColor: Colors.danger },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },
  selectInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, color: Colors.text, flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  activeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 20,
  },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  pickerMenu: { backgroundColor: Colors.card, borderRadius: 16, padding: 8, width: '100%', maxWidth: 340 },
  pickerTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, paddingHorizontal: 12, paddingVertical: 8 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 },
  pickerOptionActive: { backgroundColor: Colors.primaryLight },
  pickerText: { fontSize: 14, color: Colors.text },
  pickerTextActive: { color: Colors.primary, fontWeight: '600' },
});
