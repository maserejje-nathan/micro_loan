import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import {
  approveLoanApplication,
  fetchLoanApplication,
  rejectLoanApplication,
  submitLoanApplication,
} from '../../api/loanApplications';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PromptModal } from '../../components/PromptModal';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName, formatMoney, formatStatus } from '../../lib/format';
import type { LenderApplicationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  LenderApplicationsStackParamList,
  'ApplicationDetail'
>;

export function ApplicationDetailScreen({ route }: Props) {
  const { user, can } = useAuth();
  const currency = user?.organization?.currency ?? 'UGX';
  const loader = useCallback(
    () => fetchLoanApplication(route.params.id),
    [route.params.id],
  );
  const { data, loading, refreshing, error, refresh, setData } =
    useResource(loader);
  const [acting, setActing] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveAmount, setApproveAmount] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const status = data?.status ?? '';

  async function runAction(action: () => Promise<unknown>) {
    setActing(true);
    setActionError(null);
    try {
      await action();
      const updated = await fetchLoanApplication(route.params.id);
      setData(updated);
      Alert.alert('Done', 'Application updated.');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Action failed. Try again.',
      );
    } finally {
      setActing(false);
      setApproveOpen(false);
      setRejectOpen(false);
    }
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={data?.reference_number ?? `Application #${route.params.id}`}
        subtitle={formatStatus(status)}
      />
      <ErrorBanner message={error ?? actionError} />

      <Card>
        <View style={styles.grid}>
          <DetailField
            label="Customer"
            value={
              data?.customer_name ?? displayName(data?.customer)
            }
          />
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
          <DetailField
            label="Rejection reason"
            value={data?.rejection_reason}
          />
        </View>
      </Card>

      <View style={styles.actions}>
        {can('loan_applications.manage') && status === 'draft' ? (
          <PrimaryButton
            label="Submit"
            loading={acting}
            onPress={() =>
              void runAction(() => submitLoanApplication(route.params.id))
            }
          />
        ) : null}
        {can('loan_applications.approve') &&
        (status === 'submitted' || status === 'pending' || status === 'under_review') ? (
          <>
            <PrimaryButton
              label="Approve"
              loading={acting}
              onPress={() => {
                setApproveAmount(
                  String(data?.requested_amount ?? data?.approved_amount ?? ''),
                );
                setApproveOpen(true);
              }}
            />
            <PrimaryButton
              label="Reject"
              variant="danger"
              loading={acting}
              onPress={() => {
                setRejectReason('');
                setRejectOpen(true);
              }}
            />
          </>
        ) : null}
      </View>

      <PromptModal
        visible={approveOpen}
        title="Approve amount"
        placeholder="Approved amount"
        value={approveAmount}
        onChangeText={setApproveAmount}
        keyboardType="decimal-pad"
        confirmLabel="Approve"
        loading={acting}
        onCancel={() => setApproveOpen(false)}
        onConfirm={() =>
          void runAction(() =>
            approveLoanApplication(route.params.id, {
              approved_amount: Number(approveAmount) || undefined,
            }),
          )
        }
      />

      <PromptModal
        visible={rejectOpen}
        title="Rejection reason"
        placeholder="Why is this being rejected?"
        value={rejectReason}
        onChangeText={setRejectReason}
        multiline
        confirmLabel="Reject"
        loading={acting}
        onCancel={() => setRejectOpen(false)}
        onConfirm={() =>
          void runAction(() =>
            rejectLoanApplication(route.params.id, {
              rejection_reason: rejectReason,
            }),
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  actions: { gap: 10 },
});
