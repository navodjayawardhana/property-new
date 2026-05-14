/**
 * Admin section layout — side-drawer navigator for all admin screens.
 *
 * Auth guard: if useAuth() returns no user, immediately redirects to login.
 * This means every screen inside /(admin)/ is automatically protected.
 *
 * Drawer menu items (in order):
 *   Dashboard, Users, Properties, Inquiries, News Articles,
 *   Loan Applications, Bank Loan Rates, Homepage Slides, Pricing Settings
 *
 * add-property and edit-property are registered as Drawer.Screen entries
 * (so they inherit the header style) but are hidden from the sidebar with
 * drawerItemStyle: { display: 'none' }. They are navigated to programmatically
 * from the Properties screen.
 *
 * CustomDrawerContent shows the app logo, the logged-in admin's name/email,
 * and a Sign Out button at the bottom of the drawer.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.drawerSafe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoRow}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.logoSub}>Admin Panel</Text>
        </View>
        {user && (
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatarImg} />
              ) : (
                <Text style={styles.userAvatarText}>
                  {user.name.slice(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Nav Items + Logout on white background */}
      <View style={styles.drawerBody}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerItems}
          showsVerticalScrollIndicator={false}
        >
          <DrawerItemList {...props} />
        </DrawerContentScrollView>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          height: 84,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: '#fff',
          letterSpacing: -0.3,
        },
        headerTitleAlign: 'left',
        headerRight: () => (
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        ),
        drawerStyle: { backgroundColor: Colors.background, width: 280 },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textMuted,
        drawerActiveBackgroundColor: Colors.primaryLight,
        drawerLabelStyle: { fontSize: 14, fontWeight: '600', marginLeft: -8 },
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 8 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          drawerLabel: 'Users',
          title: 'Users',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="properties"
        options={{
          drawerLabel: 'Properties',
          title: 'Properties',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="inquiries"
        options={{
          drawerLabel: 'Inquiries',
          title: 'Inquiries',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="news"
        options={{
          drawerLabel: 'News',
          title: 'News Articles',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="loans"
        options={{
          drawerLabel: 'Loan Applications',
          title: 'Loan Applications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="banks"
        options={{
          drawerLabel: 'Bank Rates',
          title: 'Bank Loan Rates',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="slides"
        options={{
          drawerLabel: 'Slides',
          title: 'Homepage Slides',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Pricing Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="add-property"
        options={{
          title: 'Add Property',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="edit-property"
        options={{
          title: 'Edit Property',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerSafe: { flex: 1, backgroundColor: Colors.primary },
  drawerBody: { flex: 1, backgroundColor: Colors.background },
  drawerHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  logoRow: {
    alignItems: 'center',
    gap: 4,
  },
  logoImg: {
    width: '100%',
    height: 52,
  },
  logoSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  userAvatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  drawerItems: { paddingTop: 8, paddingBottom: 8 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
  },
  headerLogo: {
    width: 110,
    height: 38,
    marginRight: 16,
    marginBottom: 10,
    opacity: 0.95,
  },
});
