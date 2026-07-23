import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import {
  fetchPortalApplication,
  submitPortalApplication,
} from '../../api/portal';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import type { PortalApplicationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  PortalApplicationsStackParamList,
  'PortalApplicationDetail'
>;

export function PortalApplicationDetailScreen({ route }: Props) {
  const { portalCustomer } = useAuth();
  const currency = portalCustomer?.organization?.currency ?? 'UGX';
  const loader = useCallback(
    () => fetchPortalApplication(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh, setData } =
    useResource(loader);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function onSubmit() {
    setActing(true);
    setActionError(null);
    try {
      await submitPortalApplication(route.params.id);
      const updated = await fetchPortalApplication(route.params.id);
      setData(updated);
      Alert.alert('Submitted', 'Your application was submitted for review.');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Submit failed.',
      );
    } finally {
      setActing(false);
    }
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={data?.reference_number ?? `Application #${route.params.id}`}
        subtitle={formatStatus(data?.status)}
      />
      <ErrorBanner message={error ?? actionError} />
      <Card>
        <View style={styles.grid}>
          <DetailField
            label="Product"
            value={data?.product_name ?? data?.product?.name}
          />
          <DetailField
            label="Requested"
            value={formatMoney(data?.requested_amount, currency)}
          />
          <DetailField
            label="Approved"
            value={formatMoney(data?.approved_amount, currency)}
          />
          <DetailField label="Term (days)" value={data?.term_days} />
          <DetailField label="Purpose" value={data?.purpose} />
        </View>
      </Card>
      {data?.status === 'draft' ? (
        <PrimaryButton
          label="Submit application"
          loading={acting}
          onPress={() => void onSubmit()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
});
