import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { fetchOrganization } from '../../api/admin';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import { colors } from '../../theme/colors';
import type { AdminOrganizationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  AdminOrganizationsStackParamList,
  'OrganizationDetail'
>;

export function OrganizationDetailScreen({ route }: Props) {
  const loader = useCallback(
    () => fetchOrganization(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title={data?.name ?? 'Organization'} subtitle={data?.slug} />
      <ErrorBanner message={error} />
      <Card>
        <View style={styles.grid}>
          <DetailField label="Currency" value={data?.currency} />
          <DetailField label="Email" value={data?.email} />
          <DetailField label="Subdomain" value={data?.subdomain} />
        </View>
      </Card>

      {data?.subscription ? (
        <Card>
          <Text style={styles.section}>Subscription</Text>
          <View style={styles.grid}>
            <DetailField
              label="Plan"
              value={
                data.subscription.plan_name ??
                (data.subscription as { plan?: { name?: string } }).plan?.name
              }
            />
            <DetailField
              label="Status"
              value={formatStatus(data.subscription.status)}
            />
            <DetailField
              label="Interval"
              value={formatStatus(
                data.subscription.billing_interval ??
                  (data.subscription as { plan?: { billing_interval?: string } })
                    .plan?.billing_interval,
              )}
            />
          </View>
        </Card>
      ) : null}

      {data?.usage ? (
        <Card>
          <Text style={styles.section}>Usage</Text>
          <View style={styles.grid}>
            {Object.entries(data.usage).map(([key, value]) => (
              <DetailField
                key={key}
                label={key.replaceAll('_', ' ')}
                value={
                  typeof value === 'number' && key.includes('amount')
                    ? formatMoney(value, data.currency)
                    : value
                }
              />
            ))}
          </View>
        </Card>
      ) : null}

      {(data?.users ?? []).length > 0 ? (
        <Card>
          <Text style={styles.section}>Users</Text>
          {data?.users?.map((member) => (
            <View key={member.id} style={styles.userRow}>
              <Text style={styles.userName}>{member.name}</Text>
              <Text style={styles.userEmail}>{member.email}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  section: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    marginBottom: 4,
  },
  userRow: { gap: 2, marginTop: 8 },
  userName: {
    color: colors.ink,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  userEmail: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
});
