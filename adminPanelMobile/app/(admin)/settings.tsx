/**
 * Pricing Settings screen.
 *
 * Reads and writes the three fee values stored in the backend `settings` table
 * (GET /admin/settings, PUT /admin/settings):
 *
 *   listing_fee         — base fee charged to sellers when they list a property (LKR)
 *   processing_fee_pct  — percentage surcharge on top of the listing fee (0–100%)
 *   commission_pct      — agent commission on property sales (0–100%)
 *
 * A "Live Calculation" preview updates in real-time as the admin types,
 * showing: listing fee + processing fee = total charge per listing.
 *
 * The Reset button reverts unsaved changes to the last saved values.
 * Save is disabled when there are no changes (hasChanges check).
 *
 * All three inputs are validated before the API call:
 *   - Must be valid numbers (not NaN)
 *   - listing_fee ≥ 0, both percentages between 0–100
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { ScreenLoader } from '@/components/ScreenLoader';
import { Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminSettings } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AdminSettings } from '@/lib/types';

function formatLKR(n: number) {
  return n.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function SettingsScreen() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const [listingFee, setListingFee] = useState('');
  const [processingPct, setProcessingPct] = useState('');
  const [commissionPct, setCommissionPct] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminSettings.get(token);
      setSettings(data);
      setListingFee(String(data.listing_fee));
      setProcessingPct(String(data.processing_fee_pct));
      setCommissionPct(String(data.commission_pct));
    } catch (err) {
      toast.error('Failed to Load Settings', friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const listingFeeNum = parseFloat(listingFee) || 0;
  const processingPctNum = parseFloat(processingPct) || 0;
  const processingFeeAmount = (listingFeeNum * processingPctNum) / 100;
  const total = listingFeeNum + processingFeeAmount;

  const handleSave = async () => {
    if (!token) return;
    const feeNum = parseFloat(listingFee);
    const procNum = parseFloat(processingPct);
    const commNum = parseFloat(commissionPct);
    if (isNaN(feeNum) || feeNum < 0) { toast.warning('Validation', 'Listing fee must be a valid non-negative number.'); return; }
    if (isNaN(procNum) || procNum < 0 || procNum > 100) { toast.warning('Validation', 'Processing fee must be between 0–100%.'); return; }
    if (isNaN(commNum) || commNum < 0 || commNum > 100) { toast.warning('Validation', 'Commission must be between 0–100%.'); return; }

    setSaving(true);
    try {
      const updated = await adminSettings.update(token, {
        listing_fee: feeNum,
        processing_fee_pct: procNum,
        commission_pct: commNum,
      });
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error('Save Failed', friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!settings) return;
    setListingFee(String(settings.listing_fee));
    setProcessingPct(String(settings.processing_fee_pct));
    setCommissionPct(String(settings.commission_pct));
  };

  const hasChanges =
    settings &&
    (parseFloat(listingFee) !== settings.listing_fee ||
      parseFloat(processingPct) !== settings.processing_fee_pct ||
      parseFloat(commissionPct) !== settings.commission_pct);

  if (loading) {
    return <ScreenLoader message="Loading settings…" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Pricing Settings</Text>
              <Text style={styles.headerSub}>Configure listing fees and commissions</Text>
            </View>
          </View>

          {/* Listing Fee */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Fee</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <View style={styles.inputPrefix}>
                  <Text style={styles.prefixText}>LKR</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={listingFee}
                  onChangeText={setListingFee}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.hint}>
                Base fee charged to property listers. Set to 0 for free listings.
              </Text>
            </View>
          </View>

          {/* Processing Fee */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Processing Fee</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.inputNoPrefix]}
                  value={processingPct}
                  onChangeText={setProcessingPct}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
                <View style={styles.inputSuffix}>
                  <Text style={styles.suffixText}>%</Text>
                </View>
              </View>
              <Text style={styles.hint}>
                Percentage applied on top of the listing fee.
              </Text>
            </View>
          </View>

          {/* Commission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent Commission</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.inputNoPrefix]}
                  value={commissionPct}
                  onChangeText={setCommissionPct}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <View style={styles.inputSuffix}>
                  <Text style={styles.suffixText}>%</Text>
                </View>
              </View>
              <Text style={styles.hint}>Agent commission percentage on property sales.</Text>
            </View>
          </View>

          {/* Live Calculation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Calculation</Text>
            <View style={styles.calcCard}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Listing Fee</Text>
                <Text style={styles.calcValue}>LKR {formatLKR(listingFeeNum)}</Text>
              </View>
              <View style={styles.calcDivider} />
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>
                  Processing Fee ({processingPctNum}%)
                </Text>
                <Text style={styles.calcValue}>+ LKR {formatLKR(processingFeeAmount)}</Text>
              </View>
              <View style={styles.calcDividerThick} />
              <View style={styles.calcRow}>
                <Text style={styles.calcTotalLabel}>Total Charge</Text>
                <Text style={styles.calcTotal}>LKR {formatLKR(total)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.resetBtn, !hasChanges && styles.resetBtnDisabled]}
              onPress={() => setResetConfirm(true)}
              disabled={!hasChanges || saving}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!hasChanges || saving) && styles.saveBtnDisabled,
                saved && styles.saveBtnSaved,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : saved ? (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Settings Saved!</Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {!hasChanges && !saved && (
            <Text style={styles.noChanges}>No unsaved changes</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={resetConfirm}
        title="Reset Changes"
        message="All unsaved changes will be reverted to the last saved values."
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 48, gap: 16 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputPrefix: {
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputNoPrefix: { paddingLeft: 14 },
  inputSuffix: {
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  suffixText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  hint: { fontSize: 12, color: Colors.textLight, lineHeight: 17 },
  calcCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontSize: 14, color: Colors.primaryDark },
  calcValue: { fontSize: 14, fontWeight: '600', color: Colors.primaryDark },
  calcDivider: { height: 1, backgroundColor: Colors.primary + '30' },
  calcDividerThick: { height: 1.5, backgroundColor: Colors.primary + '50' },
  calcTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark },
  calcTotal: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  actionRow: { flexDirection: 'row', gap: 10 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 16, minHeight: 54, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 20 },
  resetBtnDisabled: { opacity: 0.4 },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
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
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnSaved: { backgroundColor: Colors.primaryDark },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  noChanges: { textAlign: 'center', fontSize: 13, color: Colors.textLight },
});
