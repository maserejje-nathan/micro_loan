import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchPortalApplications } from '../../api/portal';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import type { PortalApplicationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  PortalApplicationsStackParamList,
  'PortalApplicationsList'
>;

export function PortalApplicationsListScreen({ navigation }: Props) {
  const { portalCustomer } = useAuth();
  const currency = portalCustomer?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchPortalApplications(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const applications = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="My applications" />
      <PrimaryButton
        label="New application"
        onPress={() => navigation.navigate('PortalApplicationCreate')}
      />
      <ErrorBanner message={error} />
      {applications.length === 0 ? (
        <EmptyState
          title="No applications"
          description="Start a draft application to request a loan."
        />
      ) : (
        applications.map((application) => (
          <ListRow
            key={application.id}
            title={
              application.reference_number ?? `Application #${application.id}`
            }
            subtitle={
              application.product_name ?? application.product?.name
            }
            meta={formatMoney(application.requested_amount, currency)}
            right={formatStatus(application.status)}
            onPress={() =>
              navigation.navigate('PortalApplicationDetail', {
                id: application.id,
              })
            }
          />
        ))
      )}
    </Screen>
  );
}
