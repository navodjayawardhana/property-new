/**
 * Global toast notification component — mounts once in RootLayout.
 *
 * On mount it registers itself as the active alert handler via registerAlertHandler().
 * When toast.success/error/warning/info is called anywhere in the app, this
 * component animates a banner in from the top of the screen.
 *
 * Behaviour:
 *   - Slides in with a spring animation, auto-dismisses after `duration` ms (default 3500)
 *   - Tapping the × button dismisses immediately
 *   - Calling a new toast while one is visible resets the timer and replaces the content
 *   - Position respects the safe-area top inset (notch / status bar)
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertPayload, AlertType, registerAlertHandler } from '@/lib/alert';

// ─── Theme per type ───────────────────────────────────────────────────────────

const THEME: Record<AlertType, { bg: string; border: string; icon: string; iconColor: string; titleColor: string; msgColor: string }> = {
  success: {
    bg: '#f0fdf4', border: '#16a34a',
    icon: 'checkmark-circle', iconColor: '#16a34a',
    titleColor: '#14532d', msgColor: '#166534',
  },
  error: {
    bg: '#fef2f2', border: '#ef4444',
    icon: 'close-circle', iconColor: '#ef4444',
    titleColor: '#7f1d1d', msgColor: '#991b1b',
  },
  warning: {
    bg: '#fffbeb', border: '#f59e0b',
    icon: 'warning', iconColor: '#f59e0b',
    titleColor: '#78350f', msgColor: '#92400e',
  },
  info: {
    bg: '#eff6ff', border: '#3b82f6',
    icon: 'information-circle', iconColor: '#3b82f6',
    titleColor: '#1e3a5f', msgColor: '#1d4ed8',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AppAlert() {
  const insets = useSafeAreaInsets();
  const [alert, setAlert] = useState<AlertPayload | null>(null);
  const [visible, setVisible] = useState(false);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setAlert(null);
    });
  };

  const show = (payload: AlertPayload) => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setAlert(payload);
    setVisible(true);

    // Reset position immediately then animate in
    translateY.setValue(-120);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(dismiss, payload.duration ?? 3500);
  };

  useEffect(() => {
    registerAlertHandler(show);
    return () => {
      registerAlertHandler(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !alert) return null;

  const theme = THEME[alert.type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          backgroundColor: theme.bg,
          borderLeftColor: theme.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.border }]} />

      {/* Icon */}
      <Ionicons name={theme.icon as keyof typeof Ionicons.glyphMap} size={24} color={theme.iconColor} style={styles.icon} />

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: theme.titleColor }]} numberOfLines={2}>
          {alert.title}
        </Text>
        {alert.message ? (
          <Text style={[styles.message, { color: theme.msgColor }]} numberOfLines={3}>
            {alert.message}
          </Text>
        ) : null}
      </View>

      {/* Close */}
      <TouchableOpacity onPress={dismiss} hitSlop={10} style={styles.closeBtn}>
        <Ionicons name="close" size={18} color={theme.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderLeftWidth: 4,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingLeft: 0,
    paddingRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 12,
  },
  icon: { flexShrink: 0, marginTop: 1 },
  textWrap: { flex: 1, gap: 3, marginLeft: 10 },
  title: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  message: { fontSize: 13, lineHeight: 18 },
  closeBtn: { marginLeft: 8, marginTop: 2 },
});
