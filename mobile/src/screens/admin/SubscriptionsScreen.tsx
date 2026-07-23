import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  activateSubscription,
  cancelSubscription,
  fetchSubscriptions,
  renewSubscription,
} from '../../api/admin';
import { ApiError } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatStatus } from '../../lib/format';
import type { Subscription } from '../../types';

export function SubscriptionsScreen() {
  const loader = useCallback(() => fetchSubscriptions(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const subscriptions = data?.data ?? [];

  async function run(
    subscription: Subscription,
    action: 'cancel' | 'activate' | 'renew',
  ) {
    setActingId(subscription.id);
    setActionError(null);
    try {
      if (action === 'cancel') {
        await cancelSubscription(subscription.id);
      } else if (action === 'activate') {
        await activateSubscription(subscription.id);
      } else {
        await renewSubscription(subscription.id);
      }
      await refresh();
      Alert.alert('Updated', `Subscription ${action}d.`);
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Action failed.',
      );
    } finally {
      setActingId(null);
    }
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="Subscriptions" />
      <ErrorBanner message={error ?? actionError} />
      {subscriptions.length === 0 ? (
        <EmptyState title="No subscriptions" />
      ) : (
        subscriptions.map((subscription) => (
          <View key={subscription.id} style={{ gap: 8 }}>
            <ListRow
              title={
                subscription.organization_name ??
                `Org #${subscription.organization_id ?? subscription.id}`
              }
              subtitle={subscription.plan_name}
              right={formatStatus(subscription.status)}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <PrimaryButton
                label="Activate"
                variant="secondary"
                loading={actingId === subscription.id}
                onPress={() => void run(subscription, 'activate')}
                style={{ flexGrow: 1 }}
              />
              <PrimaryButton
                label="Renew"
                variant="secondary"
                loading={actingId === subscription.id}
                onPress={() => void run(subscription, 'renew')}
                style={{ flexGrow: 1 }}
              />
              <PrimaryButton
                label="Cancel"
                variant="danger"
                loading={actingId === subscription.id}
                onPress={() => void run(subscription, 'cancel')}
                style={{ flexGrow: 1 }}
              />
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
