import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchLoans } from '../../api/loans';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName, formatMoney, formatStatus } from '../../lib/format';
import type { LenderLoansStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderLoansStackParamList, 'LoansList'>;

export function LoansListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchLoans(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const loans = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="Loans"
        subtitle={`${data?.meta?.total ?? loans.length} total`}
      />
      <ErrorBanner message={error} />
      {loans.length === 0 ? (
        <EmptyState
          title="No loans"
          description="Disbursed loans will appear in this list."
        />
      ) : (
        loans.map((loan) => (
          <ListRow
            key={loan.id}
            title={
              loan.reference_number ??
              loan.customer_name ??
              displayName(loan.customer) ??
              `Loan #${loan.id}`
            }
            subtitle={
              loan.customer_name ?? displayName(loan.customer) ?? undefined
            }
            meta={formatMoney(
              loan.outstanding_balance ?? loan.principal,
              currency,
            )}
            right={formatStatus(loan.status)}
            onPress={() => navigation.navigate('LoanDetail', { id: loan.id })}
          />
        ))
      )}
    </Screen>
  );
}
