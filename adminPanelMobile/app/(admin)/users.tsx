/**
 * Users management screen.
 *
 * Lists all registered users (buyers, sellers, agents, admins) with:
 *   - Live search (debounced 400ms) by name or email
 *   - Role filter chips (All / Buyer / Seller / Agent / Admin)
 *   - Pagination — 5 users per page
 *
 * Per-user actions (via a bottom-sheet modal):
 *   - Change role  → PATCH /admin/users/:id  { role }
 *   - Block/Unblock → POST /admin/users/:id/toggle-block
 *   - Delete       → DELETE /admin/users/:id (with confirmation modal)
 *
 * Self-delete and self-block are prevented both client-side and server-side.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { CustomSwitch } from '@/components/CustomSwitch';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';
import { ScreenLoader } from '@/components/ScreenLoader';
import { Colors, BadgeColors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminUsers } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';

const ROLE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Buyers', value: 'buyer' },
  { label: 'Sellers', value: 'seller' },
  { label: 'Agents', value: 'agent' },
  { label: 'Admins', value: 'admin' },
];

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Agent', value: 'agent' },
  { label: 'Admin', value: 'admin' },
];

export default function UsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [blockingId, setBlockingId] = useState<number | null>(null);

  // Role change state
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 1, s = search, r = roleFilter) => {
      if (!token) return;
      try {
        const res = await adminUsers.list(token, { search: s, role: r, page: p });
        setUsers(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
        setPage(res.current_page);
      } catch (err) {
        toast.error('Failed to Load Users', friendlyError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, search, roleFilter]
  );

  useEffect(() => { load(); }, []);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, text, roleFilter), 400);
  };

  const onRoleChange = (role: string) => { setRoleFilter(role); load(1, search, role); };
  const onPageChange = (p: number) => load(p, search, roleFilter);
  const onRefresh = () => { setRefreshing(true); load(1, search, roleFilter); };

  const handleToggleBlock = async (user: User) => {
    if (!token) return;
    setBlockingId(user.id);
    try {
      const updated = await adminUsers.toggleBlock(token, user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setBlockingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminUsers.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      load(page, search, roleFilter);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!roleTarget || !token) return;
    setRoleChanging(true);
    try {
      const updated = await adminUsers.update(token, roleTarget.id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === roleTarget.id ? updated : u)));
      setRoleTarget(null);
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setRoleChanging(false);
    }
  };

  function formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderItem = ({ item }: { item: User }) => {
    const roleColors = BadgeColors.role[item.role] ?? { bg: Colors.gray100, text: Colors.gray600 };
    return (
      <View style={styles.card}>
        {/* Top: avatar + info + role badge (tappable to change) */}
        <View style={styles.cardTop}>
          <Avatar uri={item.avatar} name={item.name} size={44} />
          <View style={styles.cardInfo}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{item.email ?? item.phone ?? '—'}</Text>
            {(item.suburb || item.state) && (
              <Text style={styles.userLocation} numberOfLines={1}>
                <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                {' '}{[item.suburb, item.state].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
          {/* Tappable role badge → opens role picker */}
          <TouchableOpacity
            style={styles.roleBadgeBtn}
            onPress={() => setRoleTarget(item)}
            activeOpacity={0.75}
          >
            <Badge label={item.role} bg={roleColors.bg} color={roleColors.text} size="md" />
            <Ionicons name="chevron-down" size={11} color={roleColors.text} style={styles.roleChevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardDivider} />

        {/* Bottom: status + join date + block toggle + delete */}
        <View style={styles.cardBottom}>
          <View style={styles.cardMeta}>
            <View style={[styles.statusDot, { backgroundColor: item.is_blocked ? Colors.danger : Colors.primary }]} />
            <Text style={[styles.statusText, { color: item.is_blocked ? Colors.danger : Colors.primary }]}>
              {item.is_blocked ? 'Blocked' : 'Active'}
            </Text>
            <Text style={styles.joinDate}>{formatDate(item.created_at)}</Text>
          </View>

          <View style={styles.cardActions}>
            {blockingId === item.id ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <CustomSwitch
                value={!item.is_blocked}
                onValueChange={() => handleToggleBlock(item)}
                size="sm"
              />
            )}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={17} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search users..." />
        <FilterChips options={ROLE_FILTERS} selected={roleFilter} onSelect={onRoleChange} />
        <Text style={styles.countText}>{total} user{total !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ScreenLoader message="Loading users…" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No users found" subtitle="Try adjusting your filters" />}
          ListFooterComponent={<Pagination currentPage={page} lastPage={lastPage} total={total} perPage={5} onPageChange={onPageChange} />}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Role change modal */}
      <Modal
        visible={!!roleTarget}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setRoleTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => !roleChanging && setRoleTarget(null)}>
          <View style={styles.roleOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.roleMenu}>
                {/* Header */}
                <View style={styles.roleMenuHeader}>
                  <View style={styles.roleMenuUser}>
                    <Avatar uri={roleTarget?.avatar} name={roleTarget?.name} size={36} />
                    <View>
                      <Text style={styles.roleMenuName} numberOfLines={1}>{roleTarget?.name}</Text>
                      <Text style={styles.roleMenuEmail} numberOfLines={1}>{roleTarget?.email}</Text>
                    </View>
                  </View>
                  <Text style={styles.roleMenuTitle}>Change Role</Text>
                </View>

                {/* Role options */}
                {ROLE_OPTIONS.map((opt) => {
                  const active = roleTarget?.role === opt.value;
                  const c = BadgeColors.role[opt.value];
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.roleOption, active && styles.roleOptionActive]}
                      onPress={() => handleRoleChange(opt.value)}
                      disabled={roleChanging}
                    >
                      <View style={styles.roleOptionLeft}>
                        <View style={[styles.roleColorDot, { backgroundColor: c.text }]} />
                        <Text style={[styles.roleOptionText, active && { color: c.text, fontWeight: '700' }]}>
                          {opt.label}
                        </Text>
                      </View>
                      {roleChanging && active ? (
                        <ActivityIndicator size="small" color={c.text} />
                      ) : active ? (
                        <Ionicons name="checkmark-circle" size={18} color={c.text} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.roleCancelBtn}
                  onPress={() => setRoleTarget(null)}
                  disabled={roleChanging}
                >
                  <Text style={styles.roleCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  cardInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textMuted },
  userLocation: { fontSize: 11, color: Colors.textLight, marginTop: 2 },

  roleBadgeBtn: { alignItems: 'flex-end', gap: 3 },
  roleChevron: { alignSelf: 'center' },

  cardDivider: { height: 1, backgroundColor: Colors.borderLight },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  joinDate: { fontSize: 11, color: Colors.textLight, marginLeft: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },

  // Role modal
  roleOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  roleMenu: { backgroundColor: Colors.card, borderRadius: 18, width: '100%', maxWidth: 340, overflow: 'hidden' },
  roleMenuHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 10 },
  roleMenuUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleMenuName: { fontSize: 14, fontWeight: '700', color: Colors.text, maxWidth: 220 },
  roleMenuEmail: { fontSize: 12, color: Colors.textMuted, maxWidth: 220 },
  roleMenuTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  roleOptionActive: { backgroundColor: Colors.gray50 },
  roleOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleColorDot: { width: 10, height: 10, borderRadius: 5 },
  roleOptionText: { fontSize: 15, color: Colors.text },
  roleCancelBtn: { padding: 16, alignItems: 'center' },
  roleCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
});
