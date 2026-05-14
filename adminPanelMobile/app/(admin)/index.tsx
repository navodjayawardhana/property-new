/**
 * Dashboard screen — the home screen shown after login.
 *
 * Fetches live data from GET /admin/stats and displays:
 *   - Top stat cards: total users, properties, inquiries, featured listings
 *   - "This week" growth banner (new users / properties / inquiries)
 *   - Breakdown charts with progress bars:
 *       Users by role | Properties by status/listing type | Inquiries by status
 *   - Quick actions: View Site, View Agents (open in browser), Add Property
 *
 * Pull-to-refresh reloads the stats. Errors are silently ignored so
 * stale data stays visible rather than showing a blank screen.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { adminStats } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AdminStats } from '@/lib/types';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, iconColor, iconBg, label, value, sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string; iconBg: string;
  label: string; value: number; sub: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: iconColor }]}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue}>
          {value < 10 ? `0${value}` : value.toLocaleString()}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ─── Breakdown ────────────────────────────────────────────────────────────────

function BreakdownRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.bRow}>
      <View style={styles.bLabelRow}>
        <Text style={styles.bLabel}>{label}</Text>
        <Text style={styles.bValue}>{value}</Text>
      </View>
      <View style={styles.bBarBg}>
        <View style={[styles.bBar, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BreakdownCard({ title, icon, iconColor, iconBg, rows }: {
  title: string; icon: keyof typeof Ionicons.glyphMap;
  iconColor: string; iconBg: string;
  rows: { label: string; value: number; total: number; color: string }[];
}) {
  return (
    <View style={styles.breakCard}>
      <View style={styles.breakHeader}>
        <View style={[styles.breakIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={15} color={iconColor} />
        </View>
        <Text style={styles.breakTitle}>{title}</Text>
      </View>
      <View style={styles.breakRows}>
        {rows.map((r) => <BreakdownRow key={r.label} {...r} />)}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminStats.get(token);
      setStats(data);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!stats) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="rgba(255,255,255,0.7)"
          />
        }
      >
        {/* ── Green section: same solid colour as app header ── */}
        <View style={styles.heroSection}>
          {/* This week banner */}
          <View style={styles.weekBanner}>
            <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.weekText}>
              This week:{' '}
              <Text style={styles.weekBold}>{stats.users.new_this_week} users</Text>,{' '}
              <Text style={styles.weekBold}>{stats.properties.new_this_week} properties</Text>,{' '}
              <Text style={styles.weekBold}>{stats.inquiries.new_this_week} inquiries</Text>
            </Text>
          </View>

          {/* Stat cards — white cards on green */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                icon="people-outline"
                iconColor={Colors.info}
                iconBg={Colors.infoLight}
                label="Total Users"
                value={stats.users.total}
                sub={`+${stats.users.new_this_week} this week`}
              />
              <StatCard
                icon="home-outline"
                iconColor={Colors.indigo}
                iconBg={Colors.indigoLight}
                label="Properties"
                value={stats.properties.total}
                sub={`${stats.properties.active} active`}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="chatbubble-outline"
                iconColor={Colors.purple}
                iconBg={Colors.purpleLight}
                label="Inquiries"
                value={stats.inquiries.total}
                sub={`${stats.inquiries.pending} pending`}
              />
              <StatCard
                icon="star-outline"
                iconColor={Colors.warning}
                iconBg={Colors.warningLight}
                label="Featured"
                value={stats.properties.featured}
                sub="listings"
              />
            </View>
          </View>
        </View>

        {/* ── White content below ── */}
        <View style={[styles.whiteSection, { paddingBottom: 36 + insets.bottom }]}>

          <BreakdownCard
            title="Users by Role"
            icon="people-outline"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            rows={[
              { label: 'Buyers', value: stats.users.buyers, total: stats.users.total, color: Colors.info },
              { label: 'Sellers', value: stats.users.sellers, total: stats.users.total, color: Colors.primary },
              { label: 'Agents', value: stats.users.agents, total: stats.users.total, color: Colors.purple },
              { label: 'Admins', value: stats.users.admins, total: stats.users.total, color: Colors.danger },
            ]}
          />

          <BreakdownCard
            title="Properties by Status"
            icon="home-outline"
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            rows={[
              { label: 'Active', value: stats.properties.active, total: stats.properties.total, color: Colors.primary },
              { label: 'Inactive', value: stats.properties.inactive, total: stats.properties.total, color: Colors.textLight },
              { label: 'Sold', value: stats.properties.sold, total: stats.properties.total, color: Colors.orange },
              { label: 'For Buy', value: stats.properties.buy, total: stats.properties.total, color: Colors.indigo },
              { label: 'For Rent', value: stats.properties.rent, total: stats.properties.total, color: Colors.teal },
            ]}
          />

          <BreakdownCard
            title="Inquiries by Status"
            icon="chatbubble-outline"
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
            rows={[
              { label: 'Pending', value: stats.inquiries.pending, total: stats.inquiries.total, color: Colors.warning },
              { label: 'Contacted', value: stats.inquiries.contacted, total: stats.inquiries.total, color: Colors.info },
              { label: 'Resolved', value: stats.inquiries.resolved, total: stats.inquiries.total, color: Colors.primary },
            ]}
          />

          {/* Quick Actions */}
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Quick Actions</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickBtnOutline}
                onPress={() => Linking.openURL('https://property.adzone.space')}
                activeOpacity={0.75}
              >
                <Ionicons name="eye-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.quickBtnOutlineText}>View Site</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtnOutline}
                onPress={() => Linking.openURL('https://property.adzone.space/agents')}
                activeOpacity={0.75}
              >
                <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.quickBtnOutlineText}>View Agents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtnFilled}
                onPress={() => router.push('/(admin)/add-property')}
                activeOpacity={0.85}
              >
                <Ionicons name="home-outline" size={14} color="#fff" />
                <Text style={styles.quickBtnFilledText}>Add Property</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  // ── Green hero section — same solid colour as app header ─────────────────
  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },

  // This week banner
  weekBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  weekText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', flex: 1 },
  weekBold: { fontWeight: '700', color: '#fff' },

  // Stat card grid
  statsGrid: { gap: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderLeftWidth: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statText: { flex: 1, gap: 2 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  statSub: { fontSize: 11, color: Colors.textMuted },

  // ── White section ─────────────────────────────────────────────────────────
  whiteSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  // Breakdown
  breakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  breakHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  breakTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  breakRows: { gap: 10 },
  bRow: { gap: 4 },
  bLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bLabel: { fontSize: 12, color: Colors.textMuted },
  bValue: { fontSize: 12, fontWeight: '600', color: Colors.text },
  bBarBg: { height: 5, backgroundColor: Colors.gray100, borderRadius: 3, overflow: 'hidden' },
  bBar: { height: 5, borderRadius: 3 },

  // Quick actions
  quickCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  quickTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.card,
  },
  quickBtnOutlineText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  quickBtnFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.primary,
  },
  quickBtnFilledText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
