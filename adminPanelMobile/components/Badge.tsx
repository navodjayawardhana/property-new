import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BadgeProps = {
  label: string;
  bg: string;
  color: string;
  size?: 'sm' | 'md';
};

export function Badge({ label, bg, color, size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: bg }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textMd: {
    fontSize: 12,
  },
});
