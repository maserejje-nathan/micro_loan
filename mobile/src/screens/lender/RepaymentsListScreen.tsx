import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { fetchRepayments } from '../../api/repayments';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatDate, formatMoney, formatStatus } from '../../lib/format';
import type { LenderMoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderMoreStackParamList, 'Repayments'>;

export function RepaymentsListScreen({ navigation }: Props) {
  const { user, can } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchRepayments(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const repayments = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="Repayments" />
      {can('repayments.manage') ? (
        <PrimaryButton
          label="Record repayment"
          onPress={() => navigation.navigate('RepaymentCreate')}
        />
      ) : null}
      <ErrorBanner message={error} />
      <View style={{ gap: 10 }}>
        {repayments.length === 0 ? (
          <EmptyState
            title="No repayments"
            description="Recorded collections will show here."
          />
        ) : (
          repayments.map((repayment) => (
            <ListRow
              key={repayment.id}
              title={
                repayment.reference_number ??
                repayment.customer_name ??
                `Repayment #${repayment.id}`
              }
              subtitle={repayment.loan_reference}
              meta={`${formatMoney(repayment.amount, currency)} · ${formatDate(repayment.paid_at)}`}
              right={formatStatus(repayment.channel)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
