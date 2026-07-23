import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchLoanProducts } from '../../api/loanProducts';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatStatus } from '../../lib/format';
import type { LenderMoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<LenderMoreStackParamList, 'Products'>;

export function ProductsListScreen({ navigation }: Props) {
  const loader = useCallback(() => fetchLoanProducts(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const products = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="Loan products" />
      <ErrorBanner message={error} />
      {products.length === 0 ? (
        <EmptyState title="No products" description="Create products on the web." />
      ) : (
        products.map((product) => (
          <ListRow
            key={product.id}
            title={product.name}
            subtitle={product.code}
            meta={
              product.interest_rate != null
                ? `${product.interest_rate}%`
                : undefined
            }
            right={formatStatus(
              product.status ?? (product.is_active ? 'active' : 'inactive'),
            )}
            onPress={() =>
              navigation.navigate('ProductDetail', { id: product.id })
            }
          />
        ))
      )}
    </Screen>
  );
}
