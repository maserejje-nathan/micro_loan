import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchPortalLoans } from '../../api/portal';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import type { PortalLoansStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  PortalLoansStackParamList,
  'PortalLoansList'
>;

export function PortalLoansListScreen({ navigation }: Props) {
  const { portalCustomer } = useAuth();
  const currency = portalCustomer?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchPortalLoans(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const loans = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="My loans" />
      <ErrorBanner message={error} />
      {loans.length === 0 ? (
        <EmptyState
          title="No loans"
          description="Approved and disbursed loans will appear here."
        />
      ) : (
        loans.map((loan) => (
          <ListRow
            key={loan.id}
            title={loan.reference_number ?? `Loan #${loan.id}`}
            subtitle={loan.product_name ?? loan.product?.name}
            meta={formatMoney(
              loan.outstanding_balance ?? loan.principal,
              currency,
            )}
            right={formatStatus(loan.status)}
            onPress={() =>
              navigation.navigate('PortalLoanDetail', { id: loan.id })
            }
          />
        ))
      )}
    </Screen>
  );
}
