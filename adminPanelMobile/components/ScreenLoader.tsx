import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  message?: string;
};

export function ScreenLoader({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  card: {
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
