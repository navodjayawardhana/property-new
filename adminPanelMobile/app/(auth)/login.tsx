/**
 * Admin login screen — the only screen in the (auth) route group.
 *
 * Validates email format and password before calling POST /login.
 * The auth context (lib/auth.tsx) checks the returned user's role;
 * only role === 'admin' is accepted. Any other role gets "Access denied".
 *
 * On success, the Bearer token is saved to AsyncStorage and the user is
 * redirected to /(admin) by the root index.tsx guard.
 */

import { Ionicons } from '@expo/vector-icons';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { toast } from '@/lib/alert';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const emailTrimmed = email.trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !EMAIL_RE.test(emailTrimmed)) {
      toast.warning('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      toast.warning('Missing Password', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(emailTrimmed, password);
    } catch (err: unknown) {
      let msg = 'Login failed. Please try again.';
      if (err instanceof ApiError) {
        // Extract the first field-level validation message if present
        const fieldErrors = err.errors ? Object.values(err.errors).flat() : [];
        msg = fieldErrors[0] ?? err.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      toast.error('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <Text style={styles.brandSub}>Admin Panel</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in with your admin credentials</Text>

            <View style={styles.form}>
              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@greenbrick.net"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPwPassword]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textLight}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                    <Text style={styles.submitText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textLight} />
              <Text style={styles.footerText}>Admin access only</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    gap: 8,
    backgroundColor: Colors.primary,
  },
  logoImg: {
    width: 220,
    height: 96,
  },
  brandSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 28,
  },
  form: { gap: 18 },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 14,
  },
  inputPwPassword: { paddingRight: 8 },
  eyeBtn: { padding: 4 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 4,
    minHeight: 54,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
