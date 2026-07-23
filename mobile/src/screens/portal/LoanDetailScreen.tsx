import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { fetchPortalLoan } from '../../api/portal';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import {
  formatDate,
  formatMoney,
  formatStatus,
} from '../../lib/format';
import type { PortalLoansStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  PortalLoansStackParamList,
  'PortalLoanDetail'
>;

export function PortalLoanDetailScreen({ route }: Props) {
  const { portalCustomer } = useAuth();
  const currency = portalCustomer?.organization?.currency ?? 'UGX';
  const loader = useCallback(
    () => fetchPortalLoan(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={data?.reference_number ?? `Loan #${route.params.id}`}
        subtitle={formatStatus(data?.status)}
      />
      <ErrorBanner message={error} />
      <Card>
        <View style={styles.grid}>
          <DetailField
            label="Product"
            value={data?.product_name ?? data?.product?.name}
          />
          <DetailField
            label="Principal"
            value={formatMoney(data?.principal, currency)}
          />
          <DetailField
            label="Outstanding"
            value={formatMoney(data?.outstanding_balance, currency)}
          />
          <DetailField
            label="Total repayable"
            value={formatMoney(data?.total_repayable, currency)}
          />
          <DetailField
            label="Total repaid"
            value={formatMoney(data?.total_repaid, currency)}
          />
          <DetailField label="Term (days)" value={data?.term_days} />
          <DetailField
            label="Disbursed"
            value={formatDate(data?.disbursed_at)}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
});
