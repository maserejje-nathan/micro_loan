import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import type { LenderMoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderMoreStackParamList, 'MoreMenu'>;

export function MoreMenuScreen({ navigation }: Props) {
  const { can } = useAuth();

  const items: Array<{
    title: string;
    subtitle: string;
    route: keyof LenderMoreStackParamList;
    permission?: string;
  }> = [
    {
      title: 'Loan products',
      subtitle: 'View product catalogue',
      route: 'Products',
      permission: 'loan_products.view',
    },
    {
      title: 'Repayments',
      subtitle: 'Collections history',
      route: 'Repayments',
      permission: 'repayments.view',
    },
    {
      title: 'Reports',
      subtitle: 'Portfolio snapshot',
      route: 'Reports',
      permission: 'reports.view',
    },
    {
      title: 'Audit logs',
      subtitle: 'Activity trail',
      route: 'AuditLogs',
      permission: 'audit_logs.view',
    },
    {
      title: 'Profile',
      subtitle: 'Account & sign out',
      route: 'Profile',
    },
  ];

  return (
    <Screen>
      <SectionHeader
        title="More"
        subtitle="Products, collections, and insights"
      />
      <View style={styles.list}>
        {items
          .filter(
            (item) => !item.permission || can(item.permission),
          )
          .map((item) => (
            <ListRow
              key={item.route}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.route as never)}
            />
          ))}
      </View>
      <Text style={styles.hint}>
        Missing items? Your role may not include that permission.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  hint: {
    color: '#8B968F',
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
