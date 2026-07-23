import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { fetchCustomer } from '../../api/customers';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName, formatMoney, formatStatus } from '../../lib/format';
import { useAuth } from '../../auth/AuthContext';
import type { LenderCustomersStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  LenderCustomersStackParamList,
  'CustomerDetail'
>;

export function CustomerDetailScreen({ route }: Props) {
  const { user } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(
    () => fetchCustomer(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={displayName(data)}
        subtitle={data?.reference_number}
      />
      <ErrorBanner message={error} />
      <Card>
        <View style={styles.grid}>
          <DetailField label="Phone" value={data?.phone} />
          <DetailField label="Email" value={data?.email} />
          <DetailField label="Status" value={formatStatus(data?.status)} />
          <DetailField label="Occupation" value={data?.occupation} />
          <DetailField label="Employer" value={data?.employer_name} />
          <DetailField
            label="Monthly income"
            value={formatMoney(data?.monthly_income, currency)}
          />
          <DetailField label="Address" value={data?.address} />
          <DetailField label="District" value={data?.district} />
          <DetailField label="City" value={data?.city} />
          <DetailField label="Next of kin" value={data?.next_of_kin_name} />
          <DetailField label="Kin phone" value={data?.next_of_kin_phone} />
          <DetailField
            label="Portal"
            value={data?.portal_enabled ? 'Enabled' : 'Disabled'}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
});
