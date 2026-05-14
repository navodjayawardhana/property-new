import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type Size = 'sm' | 'md' | 'lg';

type CustomSwitchProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
};

const SIZES: Record<Size, { trackW: number; trackH: number; thumb: number; pad: number }> = {
  sm: { trackW: 40, trackH: 22, thumb: 16, pad: 3 },
  md: { trackW: 52, trackH: 28, thumb: 22, pad: 3 },
  lg: { trackW: 66, trackH: 36, thumb: 28, pad: 4 },
};

const ON_COLOR  = '#16a34a';
const OFF_COLOR = '#d1d5db';

export function CustomSwitch({
  value,
  onValueChange,
  size = 'md',
  disabled = false,
  style,
}: CustomSwitchProps) {
  const { trackW, trackH, thumb, pad } = SIZES[size];
  const travel = trackW - thumb - pad * 2;

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [OFF_COLOR, ON_COLOR],
  });

  const thumbX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [pad, pad + travel],
  });

  // Thumb shadow opacity — only when ON
  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => !disabled && onValueChange(!value)}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackW,
            height: trackH,
            borderRadius: trackH / 2,
            backgroundColor: trackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumb,
              height: thumb,
              borderRadius: thumb / 2,
              top: pad,
              left: thumbX,
              shadowOpacity,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
