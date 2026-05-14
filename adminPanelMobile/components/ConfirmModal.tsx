/**
 * Reusable confirmation dialog modal.
 *
 * Used throughout the app for destructive actions (delete, reset, overwrite).
 * Renders a centred card over a dimmed backdrop. Tapping outside the card
 * calls onCancel, same as the Cancel button.
 *
 * Props:
 *   visible       — controls whether the modal is shown
 *   title         — bold heading text
 *   message       — body text (supports multi-line, e.g. bullet lists via \n•)
 *   confirmLabel  — label for the confirm button (default: "Delete")
 *   confirmColor  — button background color (default: danger red)
 *   loading       — shows a spinner on the confirm button while an async action runs
 *   onConfirm     — called when the confirm button is tapped
 *   onCancel      — called when Cancel is tapped or backdrop is pressed
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  confirmColor = Colors.danger,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="warning-outline" size={32} color={Colors.danger} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: confirmColor }]}
                  onPress={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmText}>{confirmLabel}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
