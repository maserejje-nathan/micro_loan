import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import { disburseLoan, fetchLoan } from '../../api/loans';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import {
  displayName,
  formatDate,
  formatMoney,
  formatStatus,
} from '../../lib/format';
import type { LenderLoansStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderLoansStackParamList, 'LoanDetail'>;

export function LoanDetailScreen({ route }: Props) {
  const { user, can } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchLoan(route.params.id), [route.params.id]);
  const { data, loading, refreshing, error, refresh, setData } =
    useResource(loader);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canDisburse =
    can('loans.disburse') &&
    (data?.status === 'approved' || data?.status === 'pending_disbursement');

  async function onDisburse() {
    setActing(true);
    setActionError(null);
    try {
      await disburseLoan(route.params.id, { channel: 'cash' });
      const updated = await fetchLoan(route.params.id);
      setData(updated);
      Alert.alert('Disbursed', 'Loan marked as disbursed (cash).');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Disbursement failed.',
      );
    } finally {
      setActing(false);
    }
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={data?.reference_number ?? `Loan #${route.params.id}`}
        subtitle={formatStatus(data?.status)}
      />
      <ErrorBanner message={error ?? actionError} />

      <Card>
        <View style={styles.grid}>
          <DetailField
            label="Customer"
            value={data?.customer_name ?? displayName(data?.customer)}
          />
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
            label="Interest"
            value={
              data?.interest_rate != null
                ? `${data.interest_rate}% ${data.interest_type ?? ''}`.trim()
                : undefined
            }
          />
          <DetailField
            label="Disbursed"
            value={formatDate(data?.disbursed_at)}
          />
        </View>
      </Card>

      {canDisburse ? (
        <PrimaryButton
          label="Disburse (cash)"
          loading={acting}
          onPress={() => void onDisburse()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
});
