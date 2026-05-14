/**
 * Property Inquiries management screen.
 *
 * Shows contact messages sent by potential buyers/renters on individual listings.
 * Fetches from GET /admin/inquiries with search, status, and inquiry-type filters.
 * Paginated — 5 per page.
 *
 * Filter options:
 *   Status:       All | Pending | Contacted | Resolved
 *   Inquiry type: All | Buying | Renting | General
 *
 * Per-inquiry actions:
 *   - Update status (pending → contacted → resolved)
 *     → PATCH /admin/inquiries/:id  { status }
 *   - Contact the enquirer via email or phone (opens device mail/phone app)
 *   - Delete → DELETE /admin/inquiries/:id (with confirmation modal)
 *
 * Inquiries are submitted anonymously or by logged-in users through
 * the "Contact Agent" form on each property listing in the public app.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { FilterDropdown } from '@/components/FilterDropdown';
import { RefreshButton } from '@/components/RefreshButton';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';
import { StatusPicker } from '@/components/StatusPicker';
import { ScreenLoader } from '@/components/ScreenLoader';
import { BadgeColors, Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminInquiries } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Inquiry } from '@/lib/types';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Resolved', value: 'resolved' },
];

const TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Buying', value: 'buying' },
  { label: 'Renting', value: 'renting' },
  { label: 'General', value: 'general' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Resolved', value: 'resolved' },
];

export default function InquiriesScreen() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 1, s = search, st = statusFilter, t = typeFilter) => {
      if (!token) return;
      try {
        const res = await adminInquiries.list(token, { search: s, status: st, inquiry_type: t, page: p });
        setInquiries(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
        setPage(res.current_page);
      } catch (err) {
        toast.error('Failed to Load Inquiries', friendlyError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, search, statusFilter, typeFilter]
  );

  useEffect(() => { load(); }, []);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, text, statusFilter, typeFilter), 400);
  };

  const onStatusFilter = (v: string) => { setStatusFilter(v); load(1, search, v, typeFilter); };
  const onTypeFilter = (v: string) => { setTypeFilter(v); load(1, search, statusFilter, v); };
  const onPageChange = (p: number) => load(p, search, statusFilter, typeFilter);
  const onRefresh = () => { setRefreshing(true); load(1, search, statusFilter, typeFilter); };

  const handleStatusChange = async (inquiry: Inquiry, status: string) => {
    if (!token) return;
    setUpdatingId(inquiry.id);
    try {
      const updated = await adminInquiries.update(token, inquiry.id, { status });
      setInquiries((prev) => prev.map((i) => (i.id === inquiry.id ? updated : i)));
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
      await adminInquiries.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      load(page, search, statusFilter, typeFilter);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderItem = ({ item }: { item: Inquiry }) => {
    const statusColors = BadgeColors.inquiryStatus[item.status] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const isExpanded = expandedIds.has(item.id);
    const isUpdating = updatingId === item.id;

    const typeColor: Record<string, { bg: string; text: string }> = {
      buying: { bg: Colors.infoLight, text: Colors.info },
      renting: { bg: Colors.tealLight, text: Colors.teal },
      general: { bg: Colors.gray100, text: Colors.gray600 },
    };
    const tc = typeColor[item.inquiry_type] ?? typeColor.general;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHead}>
          <Avatar uri={item.user?.avatar} name={item.name} size={42} />
          <View style={styles.headInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            <View style={styles.badgeRow}>
              <Badge label={item.inquiry_type} bg={tc.bg} color={tc.text} />
              <Badge label={item.status} bg={statusColors.bg} color={statusColors.text} />
            </View>
          </View>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>

        {/* Message */}
        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.msgBox}>
          <Text style={styles.msg} numberOfLines={isExpanded ? undefined : 2}>{item.message}</Text>
          {item.message.length > 100 && (
            <Text style={styles.showMore}>{isExpanded ? 'Show less' : 'Show more'}</Text>
          )}
        </TouchableOpacity>

        {/* Property */}
        {item.property && (
          <View style={styles.propBox}>
            <Ionicons name="home-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.propName} numberOfLines={1}>{item.property.title}</Text>
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Actions */}
        <View style={styles.cardBottom}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <StatusPicker options={STATUS_OPTIONS} value={item.status} onChange={(v) => handleStatusChange(item, v)} />
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.emailBtn}
              onPress={() => Linking.openURL(`mailto:${item.email}`)}
            >
              <Ionicons name="mail-outline" size={15} color={Colors.info} />
              <Text style={styles.emailBtnText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setDeleteTarget(item)}
            >
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
        {/* Search bar */}
        <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search inquiries..." />

        {/* Dropdowns + Refresh */}
        <View style={styles.filterRow}>
          <FilterDropdown
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={onStatusFilter}
            placeholder="All statuses"
            style={{ flex: 1 }}
          />
          <FilterDropdown
            options={TYPE_FILTERS}
            value={typeFilter}
            onChange={onTypeFilter}
            placeholder="All types"
            style={{ flex: 1 }}
          />
          <RefreshButton refreshing={refreshing} onPress={onRefresh} />
        </View>

        <Text style={styles.countText}>{total} inquir{total !== 1 ? 'ies' : 'y'}</Text>
      </View>

      {loading ? (
        <ScreenLoader message="Loading inquiries…" />
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState icon="chatbubble-outline" title="No inquiries found" subtitle="Try adjusting your filters" />
          }
          ListFooterComponent={
            <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={5} onPageChange={onPageChange} />
          }
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Inquiry"
        message={`Delete inquiry from "${deleteTarget?.name}"? This cannot be undone.`}
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
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countText: { fontSize: 12, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10, alignItems: 'flex-start' },
  headInfo: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text },
  email: { fontSize: 12, color: Colors.textMuted },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 3 },
  date: { fontSize: 11, color: Colors.textLight },
  msgBox: { paddingHorizontal: 14, paddingBottom: 10, gap: 4 },
  msg: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  showMore: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  propBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: Colors.gray50,
    marginHorizontal: 14,
    borderRadius: 8,
    paddingVertical: 7,
    marginBottom: 4,
  },
  propName: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  cardDivider: { height: 1, backgroundColor: Colors.borderLight },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 14,
  },
  btnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.infoLight,
  },
  emailBtnText: { fontSize: 12, fontWeight: '600', color: Colors.info },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
