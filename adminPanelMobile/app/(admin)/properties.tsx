/**
 * Properties management screen.
 *
 * Lists all property listings with search (debounced 400ms), status filter,
 * and listing-type filter. Paginated — 5 per page.
 *
 * Filter options:
 *   Status:       All | Active | Inactive | Sold
 *   Listing type: All | For Sale | For Rent | Sold
 *
 * Per-property actions (via a bottom-sheet action modal):
 *   - View on site   → opens the public listing URL in the device browser
 *   - Edit           → navigates to /(admin)/edit-property?id=<id>
 *   - Toggle feature → PATCH /admin/properties/:id  { is_featured }
 *   - Change status  → PATCH /admin/properties/:id  { status }
 *   - Delete         → DELETE /admin/properties/:id (with confirmation modal)
 *
 * The "Add Property" FAB button navigates to /(admin)/add-property.
 * Properties created by the admin have listing_fee = 0 (no charge).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
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
import { adminProperties } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Property } from '@/lib/types';

// ─── Filter options ────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Sold', value: 'sold' },
];

const TYPE_FILTERS = [
  { label: 'All types', value: '' },
  { label: 'Buy', value: 'buy' },
  { label: 'Rent', value: 'rent' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Sold', value: 'sold' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: Property) {
  if (p.listing_type === 'rent' && p.price_per_week) {
    return `LKR ${p.price_per_week.toLocaleString('en-LK')}/mo`;
  }
  return `LKR ${p.price.toLocaleString('en-LK')}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PropertiesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive thumb size — scales between 320 px and 428 px screens
  const thumbW = Math.round(width * 0.23);
  const thumbH = Math.round(thumbW * 0.8);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Dropdown action sheet
  const [menuTarget, setMenuTarget] = useState<Property | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 1, s = search, st = statusFilter, lt = typeFilter) => {
      if (!token) return;
      try {
        const res = await adminProperties.list(token, { search: s, status: st, listing_type: lt, page: p });
        setProperties(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
        setPage(res.current_page);
      } catch (err) {
        toast.error('Failed to Load Properties', friendlyError(err));
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

  const handleStatusChange = async (prop: Property, status: string) => {
    if (!token) return;
    setUpdatingId(prop.id);
    try {
      const updated = await adminProperties.update(token, prop.id, { status: status as Property['status'] });
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? updated : p)));
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (prop: Property) => {
    if (!token) return;
    setUpdatingId(prop.id);
    try {
      const updated = await adminProperties.update(token, prop.id, { is_featured: !prop.is_featured });
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? updated : p)));
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
      await adminProperties.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      load(page, search, statusFilter, typeFilter);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Card render ─────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Property }) => {
    const thumb = item.images?.find((i) => i.is_primary) ?? item.images?.[0];
    const statusColors = BadgeColors.propertyStatus[item.status] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const typeColors = BadgeColors.listingType[item.listing_type] ?? { bg: Colors.gray100, text: Colors.gray600 };
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.card}>

        {/* ── Row 1: Thumb + Info + Menu ── */}
        <View style={styles.cardHead}>
          {/* Thumbnail */}
          {thumb ? (
            <Image
              source={{ uri: thumb.url }}
              style={[styles.thumb, { width: thumbW, height: thumbH }]}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbEmpty, { width: thumbW, height: thumbH }]}>
              <Ionicons name="home-outline" size={22} color={Colors.textLight} />
            </View>
          )}

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.propTitle} numberOfLines={2}>{item.title}</Text>

            <View style={styles.addrRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.propAddr} numberOfLines={1}>
                {item.suburb}, {item.state}
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <Badge label={item.listing_type} bg={typeColors.bg} color={typeColors.text} />
              <Badge label={item.property_type} bg={Colors.gray100} color={Colors.gray600} />
            </View>

            <Text style={styles.price}>{formatPrice(item)}</Text>
          </View>

          {/* Three-dot menu */}
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setMenuTarget(item)}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Row 2: Owner + Status badges ── */}
        <View style={styles.cardMid}>
          {item.user ? (
            <View style={styles.ownerRow}>
              <Avatar uri={item.user.avatar} name={item.user.name} size={22} />
              <Text style={styles.ownerName} numberOfLines={1}>{item.user.name}</Text>
            </View>
          ) : (
            <View />
          )}

          <View style={styles.badgesRight}>
            <Badge label={item.status} bg={statusColors.bg} color={statusColors.text} />
            {item.is_featured && (
              <Badge label="Featured" bg={Colors.warningLight} color={Colors.warning} />
            )}
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Row 3: Actions ── */}
        <View style={styles.cardFoot}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={styles.footLeft}>
              {/* Featured star */}
              <TouchableOpacity
                style={[styles.iconBtn, item.is_featured && styles.iconBtnStar]}
                onPress={() => handleToggleFeatured(item)}
              >
                <Ionicons
                  name={item.is_featured ? 'star' : 'star-outline'}
                  size={15}
                  color={item.is_featured ? '#f59e0b' : Colors.textMuted}
                />
              </TouchableOpacity>

              {/* Status dropdown */}
              <StatusPicker
                options={STATUS_OPTIONS}
                value={item.status}
                onChange={(v) => handleStatusChange(item, v)}
              />
            </View>
          )}

          {/* Delete */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteTarget(item)}
          >
            <Ionicons name="trash-outline" size={15} color={Colors.danger} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search properties…" />
        <View style={styles.filterRow}>
          <FilterDropdown options={STATUS_FILTERS} value={statusFilter} onChange={onStatusFilter} placeholder="All statuses" style={{ flex: 1 }} />
          <FilterDropdown options={TYPE_FILTERS} value={typeFilter} onChange={onTypeFilter} placeholder="All types" style={{ flex: 1 }} />
          <RefreshButton refreshing={refreshing} onPress={onRefresh} />
        </View>
        <Text style={styles.countText}>{total} propert{total !== 1 ? 'ies' : 'y'}</Text>
      </View>

      {loading ? (
        <ScreenLoader message="Loading properties…" />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="home-outline" title="No properties found" subtitle="Try adjusting your filters" />}
          ListFooterComponent={<Pagination currentPage={page} lastPage={lastPage} total={total} perPage={10} onPageChange={onPageChange} />}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Property"
        message={`Delete "${deleteTarget?.title}"? This will remove all images permanently.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View / Edit action sheet */}
      <Modal
        visible={!!menuTarget}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setMenuTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuTarget(null)}>
          <View style={styles.sheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Handle */}
                <View style={styles.sheetHandle} />

                {/* Context: property title */}
                <Text style={styles.sheetTitle} numberOfLines={2}>{menuTarget?.title}</Text>
                <Text style={styles.sheetSub}>{menuTarget?.suburb}, {menuTarget?.state}</Text>

                <View style={styles.sheetDivider} />

                {/* View on site */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setMenuTarget(null);
                    Linking.openURL(`https://property.adzone.space/property/${menuTarget?.id}`);
                  }}
                >
                  <View style={[styles.sheetOptionIcon, { backgroundColor: Colors.infoLight }]}>
                    <Ionicons name="eye-outline" size={18} color={Colors.info} />
                  </View>
                  <View style={styles.sheetOptionText}>
                    <Text style={styles.sheetOptionLabel}>View on Site</Text>
                    <Text style={styles.sheetOptionDesc}>Open property page in browser</Text>
                  </View>
                  <Ionicons name="open-outline" size={15} color={Colors.textLight} />
                </TouchableOpacity>

                {/* Edit property */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setMenuTarget(null);
                    router.push(`/(admin)/edit-property?id=${menuTarget?.id}`);
                  }}
                >
                  <View style={[styles.sheetOptionIcon, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.sheetOptionText}>
                    <Text style={styles.sheetOptionLabel}>Edit Property</Text>
                    <Text style={styles.sheetOptionDesc}>Update property details</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={Colors.textLight} />
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity style={styles.sheetCancel} onPress={() => setMenuTarget(null)}>
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.card },

  // Toolbar
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countText: { fontSize: 12, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // List
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 12,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    // Soft shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Row 1
  cardHead: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  thumb: {
    borderRadius: 12,
    resizeMode: 'cover',
    flexShrink: 0,
  },
  thumbEmpty: {
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 5 },
  propTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
  },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propAddr: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  price: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginTop: 2 },

  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 14 },

  // Row 2
  cardMid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  ownerName: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  badgesRight: { flexDirection: 'row', gap: 6, flexShrink: 0 },

  // Row 3
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnStar: { borderColor: '#f59e0b', backgroundColor: Colors.warningLight },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: Colors.dangerLight,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: Colors.danger },

  // ── Action sheet ──────────────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 16,
    gap: 4,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  sheetSub: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  sheetDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sheetOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sheetOptionText: { flex: 1, gap: 2 },
  sheetOptionLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  sheetOptionDesc: { fontSize: 12, color: Colors.textMuted },
  sheetCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: Colors.gray100,
  },
  sheetCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
