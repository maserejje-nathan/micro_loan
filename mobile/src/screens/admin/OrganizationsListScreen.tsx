import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchOrganizations } from '../../api/admin';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatStatus } from '../../lib/format';
import type { AdminOrganizationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  AdminOrganizationsStackParamList,
  'OrganizationsList'
>;

export function OrganizationsListScreen({ navigation }: Props) {
  const loader = useCallback(() => fetchOrganizations(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const organizations = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="Organizations"
        subtitle={`${data?.meta?.total ?? organizations.length} tenants`}
      />
      <ErrorBanner message={error} />
      {organizations.length === 0 ? (
        <EmptyState title="No organizations" />
      ) : (
        organizations.map((organization) => (
          <ListRow
            key={organization.id}
            title={organization.name}
            subtitle={organization.slug}
            meta={organization.currency}
            right={
              organization.users_count != null
                ? `${organization.users_count} users`
                : organization.subscription_status
                  ? formatStatus(organization.subscription_status)
                  : undefined
            }
            onPress={() =>
              navigation.navigate('OrganizationDetail', {
                id: organization.id,
              })
            }
          />
        ))
      )}
    </Screen>
  );
}
