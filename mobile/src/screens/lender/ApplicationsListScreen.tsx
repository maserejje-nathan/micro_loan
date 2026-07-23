import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchLoanApplications } from '../../api/loanApplications';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName, formatMoney, formatStatus } from '../../lib/format';
import type { LenderApplicationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  LenderApplicationsStackParamList,
  'ApplicationsList'
>;

export function ApplicationsListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchLoanApplications(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const applications = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="Applications"
        subtitle={`${data?.meta?.total ?? applications.length} total`}
      />
      <ErrorBanner message={error} />
      {applications.length === 0 ? (
        <EmptyState
          title="No applications"
          description="Loan applications will appear here once created."
        />
      ) : (
        applications.map((application) => (
          <ListRow
            key={application.id}
            title={
              application.customer_name ??
              displayName(application.customer) ??
              application.reference_number ??
              `Application #${application.id}`
            }
            subtitle={
              application.product_name ??
              application.product?.name ??
              undefined
            }
            meta={formatMoney(application.requested_amount, currency)}
            right={formatStatus(application.status)}
            onPress={() =>
              navigation.navigate('ApplicationDetail', { id: application.id })
            }
          />
        ))
      )}
    </Screen>
  );
}
