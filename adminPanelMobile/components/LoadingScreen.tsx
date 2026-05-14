import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  message?: string;
};

export function LoadingScreen({ message = 'Please wait…' }: Props) {
  // Logo entrance: fade + scale spring
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.55)).current;

  // Texts block: slide up + fade
  const textOpacity    = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(18)).current;

  // Logo gentle pulse after entrance
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── entrance ──────────────────────────────────────────────────────────
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, friction: 6, tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // texts slide up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1, duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0, duration: 420,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]).start();

      // logo pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.045, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1,     duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    // ── staggered bouncing dots (start immediately) ────────────────────
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -9, duration: 310, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 310, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
          Animated.delay(640),
        ])
      );

    const b1 = bounce(dot1, 0);
    const b2 = bounce(dot2, 170);
    const b3 = bounce(dot3, 340);
    b1.start(); b2.start(); b3.start();

    return () => { b1.stop(); b2.stop(); b3.stop(); };
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Logo ── */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{ scale: Animated.multiply(logoScale, pulseScale) }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ── Texts ── */}
      <Animated.View
        style={[
          styles.texts,
          { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
        ]}
      >
        <Text style={styles.brand}>ADMIN PANEL</Text>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>

      {/* ── Bouncing dots ── */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 100,
  },
  texts: {
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
});
