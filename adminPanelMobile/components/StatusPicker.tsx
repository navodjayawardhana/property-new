import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type Option = { label: string; value: string };

type StatusPickerProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function StatusPicker({ options, value, onChange, disabled = false }: StatusPickerProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.triggerText}>{current?.label ?? value}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <Text style={styles.menuTitle}>Select Status</Text>
                {options.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.option, opt.value === value && styles.optionActive]}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[styles.optionText, opt.value === value && styles.optionTextActive]}
                    >
                      {opt.label}
                    </Text>
                    {opt.value === value && (
                      <Ionicons name="checkmark" size={16} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 8,
    width: '100%',
    maxWidth: 300,
    gap: 2,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
