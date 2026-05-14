/**
 * Loan Applications management screen.
 *
 * Shows all loan pre-approval enquiries submitted via the public app.
 * Fetches from GET /admin/loan-enquiries with search and status filter.
 * Paginated — 5 per page.
 *
 * Each card shows: applicant name/contact, loan amount, employment type,
 * annual income, loan purpose, and current status badge.
 * Tap a card to open a full-detail modal with all submitted fields.
 *
 * Per-enquiry actions:
 *   - Update status (new → in_review → pre_approved / declined)
 *     → PATCH /admin/loan-enquiries/:id  { status }
 *   - Contact applicant via phone (tap phone number to call)
 *   - Delete → DELETE /admin/loan-enquiries/:id (with confirmation modal)
 *
 * Loan enquiries are submitted by users through the public app's
 * finance/calculator section. No creation is possible from this admin panel.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';
import { StatusPicker } from '@/components/StatusPicker';
import { ScreenLoader } from '@/components/ScreenLoader';
import { BadgeColors, Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminLoans } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoanEnquiry } from '@/lib/types';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Pre-Approved', value: 'pre_approved' },
  { label: 'Declined', value: 'declined' },
];

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Pre-Approved', value: 'pre_approved' },
  { label: 'Declined', value: 'declined' },
];

function formatLKR(n: number) {
  return `LKR ${n.toLocaleString('en-LK')}`;
}

function formatPurpose(p: string) {
  return p === 'buy_home' ? 'Buy Home' : p === 'investment' ? 'Investment' : 'Refinance';
}

function formatEmployment(e: string) {
  return e.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.sectionHead}>{title}</Text>;
}

export default function LoansScreen() {
  const { token } = useAuth();
  const [loans, setLoans] = useState<LoanEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<LoanEnquiry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<LoanEnquiry | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 1, s = search, st = statusFilter) => {
      if (!token) return;
      try {
        const res = await adminLoans.list(token, { search: s, status: st, page: p });
        setLoans(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
        setPage(res.current_page);
      } catch (err) {
        toast.error('Failed to Load Loan Applications', friendlyError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, search, statusFilter]
  );

  useEffect(() => { load(); }, []);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, text, statusFilter), 400);
  };

  const onStatusFilter = (v: string) => { setStatusFilter(v); load(1, search, v); };
  const onPageChange = (p: number) => load(p, search, statusFilter);
  const onRefresh = () => { setRefreshing(true); load(1, search, statusFilter); };

  const handleStatusChange = async (loan: LoanEnquiry, status: string) => {
    if (!token) return;
    setUpdatingId(loan.id);
    try {
      const updated = await adminLoans.update(token, loan.id, { status });
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? updated : l)));
      if (detailItem?.id === loan.id) setDetailItem(updated);
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminLoans.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      setDetailItem(null);
      load(page, search, statusFilter);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderItem = ({ item }: { item: LoanEnquiry }) => {
    const sc = BadgeColors.loanStatus[item.status] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const pc = BadgeColors.loanPurpose[item.loan_purpose] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Avatar name={item.name} size={44} />
          <View style={styles.headInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            <View style={styles.badgeRow}>
              <Badge label={item.status.replace(/_/g, ' ')} bg={sc.bg} color={sc.text} />
              <Badge label={formatPurpose(item.loan_purpose)} bg={pc.bg} color={pc.text} />
              {item.selected_bank && (
                <Badge label={item.selected_bank} bg={Colors.gray100} color={Colors.gray600} />
              )}
            </View>
          </View>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Loan</Text>
            <Text style={styles.statVal}>{formatLKR(item.loan_amount)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statVal}>{formatLKR(item.annual_income)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Term</Text>
            <Text style={styles.statVal}>{item.loan_term ? `${item.loan_term}yr` : '—'}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <StatusPicker options={STATUS_OPTIONS} value={item.status} onChange={(v) => handleStatusChange(item, v)} />
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.viewBtn} onPress={() => setDetailItem(item)}>
              <Ionicons name="eye-outline" size={15} color={Colors.info} />
              <Text style={styles.viewBtnText}>View</Text>
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
        <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search by name or email..." />
        <FilterChips options={STATUS_FILTERS} selected={statusFilter} onSelect={onStatusFilter} />
        <Text style={styles.countText}>{total} application{total !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ScreenLoader message="Loading applications…" />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(l) => String(l.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="cash-outline" title="No loan applications" subtitle="Try adjusting your filters" />}
          ListFooterComponent={<Pagination currentPage={page} lastPage={lastPage} total={total} perPage={5} onPageChange={onPageChange} />}
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!detailItem} animationType="slide" onRequestClose={() => setDetailItem(null)}>
        {detailItem && (
          <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDetailItem(null)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Loan Application</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${detailItem.email}`)}>
                <Ionicons name="mail-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Status */}
              <View style={styles.statusRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <StatusPicker
                  options={STATUS_OPTIONS}
                  value={detailItem.status}
                  onChange={(v) => handleStatusChange(detailItem, v)}
                />
              </View>

              <Section title="Personal Details" />
              <DetailRow label="Name" value={detailItem.name} />
              <DetailRow label="Email" value={detailItem.email} />
              <DetailRow label="Phone" value={detailItem.phone ?? '—'} />
              {detailItem.nic_number && <DetailRow label="NIC" value={detailItem.nic_number} />}

              {detailItem.selected_bank && (
                <>
                  <Section title="Selected Bank" />
                  <DetailRow label="Bank" value={detailItem.selected_bank} />
                </>
              )}

              <Section title="Loan Details" />
              <DetailRow label="Purpose" value={formatPurpose(detailItem.loan_purpose)} />
              <DetailRow label="Loan Amount" value={formatLKR(detailItem.loan_amount)} />
              <DetailRow label="Deposit" value={formatLKR(detailItem.deposit_amount)} />
              {detailItem.loan_term && <DetailRow label="Term" value={`${detailItem.loan_term} years`} />}
              {detailItem.estimated_property_value && (
                <DetailRow label="Est. Property Value" value={formatLKR(detailItem.estimated_property_value)} />
              )}

              <Section title="Employment & Income" />
              <DetailRow label="Employment" value={formatEmployment(detailItem.employment_type)} />
              <DetailRow label="Annual Income" value={formatLKR(detailItem.annual_income)} />

              <Section title="Property" />
              <DetailRow label="Property Type" value={detailItem.property_type} />
              <DetailRow label="State" value={detailItem.property_state} />

              {detailItem.message && (
                <>
                  <Section title="Additional Notes" />
                  <Text style={styles.messageText}>{detailItem.message}</Text>
                </>
              )}

              <TouchableOpacity style={styles.deleteFullBtn} onPress={() => setDeleteTarget(detailItem)}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                <Text style={styles.deleteFullBtnText}>Delete Application</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Application"
        message={`Delete loan application from "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.card },
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  countText: { fontSize: 12, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10, alignItems: 'flex-start' },
  headInfo: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text },
  email: { fontSize: 12, color: Colors.textMuted },
  date: { fontSize: 11, color: Colors.textLight },
  badgeRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 12, gap: 0 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  statLabel: { fontSize: 10, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  statVal: { fontSize: 13, fontWeight: '700', color: Colors.text },
  cardDivider: { height: 1, backgroundColor: Colors.borderLight },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  btnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.infoLight },
  viewBtnText: { fontSize: 12, fontWeight: '600', color: Colors.info },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  modalContent: { padding: 16, gap: 0, paddingBottom: 32 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, backgroundColor: Colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  sectionHead: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailLabel: { fontSize: 13, color: Colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1, textAlign: 'right' },
  messageText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
  deleteFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  deleteFullBtnText: { fontSize: 14, fontWeight: '600', color: Colors.danger },
});
