import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchCustomers } from '../../api/customers';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName, formatStatus } from '../../lib/format';
import type { LenderCustomersStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  LenderCustomersStackParamList,
  'CustomersList'
>;

export function CustomersListScreen({ navigation }: Props) {
  const loader = useCallback(() => fetchCustomers(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const customers = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="Customers"
        subtitle={`${data?.meta?.total ?? customers.length} total`}
      />
      <ErrorBanner message={error} />
      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers created in the web app will appear here."
        />
      ) : (
        customers.map((customer) => (
          <ListRow
            key={customer.id}
            title={displayName(customer)}
            subtitle={customer.phone ?? customer.email ?? undefined}
            meta={customer.reference_number}
            right={formatStatus(customer.status)}
            onPress={() =>
              navigation.navigate('CustomerDetail', { id: customer.id })
            }
          />
        ))
      )}
    </Screen>
  );
}
