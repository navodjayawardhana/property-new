import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  refreshing: boolean;
  onPress: () => void;
};

export function RefreshButton({ refreshing, onPress }: Props) {
  const rotation    = useRef(new Animated.Value(0)).current;
  const loopRef     = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      rotation.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 700,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      loopRef.current = null;
      rotation.setValue(0);
    }
  }, [refreshing]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      disabled={refreshing}
      activeOpacity={0.75}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name="refresh-outline"
          size={18}
          color={Colors.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
});
