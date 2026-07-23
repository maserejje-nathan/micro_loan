import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label?: string;
  value?: string | number | null;
};

export function DetailField({ label, value }: Props) {
  if (!label) {
    return null;
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value == null || value === '' ? '—' : String(value)}
      </Text>
    </View>
  );
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.forestBright} size="large" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 4,
  },
  label: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    color: colors.ink,
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandSoft,
    gap: 12,
  },
  loadingText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
});
