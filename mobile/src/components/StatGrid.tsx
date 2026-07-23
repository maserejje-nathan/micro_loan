import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type StatItem = {
  label: string;
  value: string;
  wide?: boolean;
};

type Props = {
  items: StatItem[];
};

export function StatGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.card, item.wide && styles.wide]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  wide: {
    width: '100%',
  },
  label: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  value: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
  },
});
