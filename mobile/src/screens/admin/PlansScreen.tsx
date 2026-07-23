import { useCallback } from 'react';
import { fetchPlans } from '../../api/admin';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';

export function PlansScreen() {
  const loader = useCallback(() => fetchPlans(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const plans = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="Plans" />
      <ErrorBanner message={error} />
      {plans.length === 0 ? (
        <EmptyState title="No plans" />
      ) : (
        plans.map((plan) => (
          <ListRow
            key={plan.id}
            title={plan.name}
            subtitle={plan.slug}
            meta={formatMoney(plan.price, plan.currency ?? 'UGX')}
            right={formatStatus(
              plan.is_active === false ? 'inactive' : plan.billing_interval,
            )}
          />
        ))
      )}
    </Screen>
  );
}
