import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const PRIMARY = '#16a34a';

export function NoConnectionScreen() {
  // Entrance fade
  const screenOpacity = useRef(new Animated.Value(0)).current;

  // Icon: shake side-to-side
  const iconShake = useRef(new Animated.Value(0)).current;

  // Signal wave rings
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  // Dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Screen fade in
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Icon shake loop
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(iconShake, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.delay(2400),
      ])
    );
    shake.start();

    // Wave rings: expand and fade out repeatedly
    const ring = (wave: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(wave, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(wave, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const r1 = ring(wave1, 0);
    const r2 = ring(wave2, 400);
    const r3 = ring(wave3, 800);
    r1.start(); r2.start(); r3.start();

    // Dots pulse
    const dotPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    dotPulse.start();

    return () => {
      shake.stop();
      r1.stop(); r2.stop(); r3.stop();
      dotPulse.stop();
    };
  }, []);

  const handleRetry = () => NetInfo.refresh();

  return (
    <Animated.View style={[styles.overlay, { opacity: screenOpacity }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Icon + wave rings */}
        <View style={styles.iconSection}>
          {/* Expanding rings */}
          {[wave1, wave2, wave3].map((wave, i) => (
            <Animated.View
              key={i}
              style={[
                styles.ring,
                {
                  opacity: wave.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.35, 0] }),
                  transform: [{
                    scale: wave.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }),
                  }],
                },
              ]}
            />
          ))}

          {/* Icon circle */}
          <Animated.View
            style={[styles.iconCircle, { transform: [{ translateX: iconShake }] }]}
          >
            <Ionicons name="wifi-outline" size={44} color={PRIMARY} />
            {/* X badge */}
            <View style={styles.xBadge}>
              <Ionicons name="close" size={12} color="#fff" />
            </View>
          </Animated.View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>
            Please check your Wi-Fi or mobile data and try again.
          </Text>
        </View>

        {/* Connecting dots */}
        <View style={styles.dotsRow}>
          <Text style={styles.connectingLabel}>Checking connection</Text>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>

        {/* Retry button */}
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={17} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 999,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  // Icon section
  iconSection: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xBadge: {
    position: 'absolute',
    bottom: 12,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text
  textSection: { alignItems: 'center', gap: 8 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectingLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginRight: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  // Retry
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
