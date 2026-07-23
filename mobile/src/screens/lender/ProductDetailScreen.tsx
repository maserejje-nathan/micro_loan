import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { fetchLoanProduct } from '../../api/loanProducts';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import type { LenderMoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderMoreStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route }: Props) {
  const { user } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(
    () => fetchLoanProduct(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title={data?.name ?? 'Product'} subtitle={data?.code} />
      <ErrorBanner message={error} />
      <Card>
        <View style={styles.grid}>
          <DetailField label="Description" value={data?.description} />
          <DetailField
            label="Min amount"
            value={formatMoney(data?.min_amount, currency)}
          />
          <DetailField
            label="Max amount"
            value={formatMoney(data?.max_amount, currency)}
          />
          <DetailField
            label="Term range"
            value={
              data?.term_min_days != null
                ? `${data.term_min_days}–${data.term_max_days ?? '—'} days`
                : undefined
            }
          />
          <DetailField
            label="Interest"
            value={
              data?.interest_rate != null
                ? `${data.interest_rate}% ${data.interest_type ?? ''}`.trim()
                : undefined
            }
          />
          <DetailField
            label="Frequency"
            value={formatStatus(data?.repayment_frequency)}
          />
          <DetailField
            label="Processing fee"
            value={formatMoney(data?.processing_fee, currency)}
          />
          <DetailField
            label="Status"
            value={formatStatus(
              data?.status ?? (data?.is_active ? 'active' : 'inactive'),
            )}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
});
