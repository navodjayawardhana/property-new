import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type Option = { label: string; value: string };

type FilterDropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle;
};

export function FilterDropdown({ options, value, onChange, placeholder, style }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const label = selected?.value ? selected.label : (placeholder ?? options[0]?.label ?? 'All');

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.triggerText, !selected?.value && styles.triggerPlaceholder]}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={13} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                  {options.map((opt) => {
                    const active = opt.value === value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.option, active && styles.optionActive]}
                        onPress={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>
                          {opt.label}
                        </Text>
                        {active && (
                          <Ionicons name="checkmark" size={15} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 120,
  },
  triggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  triggerPlaceholder: {
    color: Colors.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginHorizontal: 6,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
