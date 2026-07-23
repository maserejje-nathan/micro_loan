import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { fetchInvoices, markInvoicePaid } from '../../api/admin';
import { ApiError } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';

export function InvoicesScreen() {
  const loader = useCallback(() => fetchInvoices(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const invoices = data?.data ?? [];

  async function onMarkPaid(id: number) {
    setActingId(id);
    setActionError(null);
    try {
      await markInvoicePaid(id);
      await refresh();
      Alert.alert('Paid', 'Invoice marked as paid.');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Could not update invoice.',
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
      <SectionHeader title="Invoices" />
      <ErrorBanner message={error ?? actionError} />
      {invoices.length === 0 ? (
        <EmptyState title="No invoices" />
      ) : (
        invoices.map((invoice) => (
          <View key={invoice.id} style={{ gap: 8 }}>
            <ListRow
              title={
                invoice.invoice_number ??
                invoice.organization_name ??
                `Invoice #${invoice.id}`
              }
              subtitle={invoice.organization_name}
              meta={formatMoney(invoice.amount, invoice.currency ?? 'UGX')}
              right={formatStatus(invoice.status)}
            />
            {invoice.status !== 'paid' ? (
              <PrimaryButton
                label="Mark paid"
                loading={actingId === invoice.id}
                onPress={() => void onMarkPaid(invoice.id)}
              />
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}
