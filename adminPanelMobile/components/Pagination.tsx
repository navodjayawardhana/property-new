/**
 * Pagination controls for list screens.
 * Renders nothing when lastPage <= 1 (no pagination needed).
 * Shows "from–to of total" on the left and prev/next chevrons on the right.
 * Disabled chevrons are dimmed (opacity 0.4) and non-pressable.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/Colors';

type PaginationProps = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        {from}–{to} of {total}
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, currentPage === 1 && styles.btnDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={currentPage === 1 ? Colors.textLight : Colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.pageText}>
          {currentPage} / {lastPage}
        </Text>
        <TouchableOpacity
          style={[styles.btn, currentPage === lastPage && styles.btnDisabled]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={currentPage === lastPage ? Colors.textLight : Colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  info: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
});
