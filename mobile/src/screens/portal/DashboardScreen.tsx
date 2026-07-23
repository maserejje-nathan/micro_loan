import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { fetchPortalDashboard } from '../../api/portal';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatGrid } from '../../components/StatGrid';
import { useResource } from '../../hooks/useResource';
import { displayName, formatMoney, formatStatus } from '../../lib/format';
import { colors } from '../../theme/colors';

export function PortalDashboardScreen() {
  const { portalCustomer } = useAuth();
  const loader = useCallback(() => fetchPortalDashboard(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const currency =
    data?.currency ?? portalCustomer?.organization?.currency ?? 'UGX';
  const name =
    displayName(portalCustomer) !== 'Unknown'
      ? displayName(portalCustomer)
      : portalCustomer?.name ?? 'Client';

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <Text style={styles.eyebrow}>
        {portalCustomer?.organization?.name ?? 'Client portal'}
      </Text>
      <Text style={styles.title}>Hello, {name}</Text>
      <Text style={styles.subtitle}>
        {data?.portal?.welcome_message ??
          'Track your loans and applications.'}
      </Text>
      <ErrorBanner message={error} />

      <StatGrid
        items={[
          {
            label: 'Active loans',
            value: String(data?.stats?.active_loans ?? 0),
          },
          {
            label: 'Outstanding',
            value: formatMoney(data?.stats?.outstanding, currency),
          },
          {
            label: 'Pending apps',
            value: String(data?.stats?.pending_applications ?? 0),
          },
          {
            label: 'Drafts',
            value: String(data?.stats?.draft_applications ?? 0),
          },
        ]}
      />

      <SectionHeader title="Recent loans" />
      {(data?.recent_loans ?? []).length === 0 ? (
        <EmptyState title="No loans yet" />
      ) : (
        data?.recent_loans?.map((loan) => (
          <Card key={loan.id}>
            <Text style={styles.ref}>{loan.reference_number}</Text>
            <Text style={styles.cardTitle}>{loan.product_name}</Text>
            <Text style={styles.meta}>
              {formatMoney(loan.outstanding_balance, currency)} ·{' '}
              {formatStatus(loan.status)}
            </Text>
          </Card>
        ))
      )}

      <SectionHeader title="Recent applications" />
      {(data?.recent_applications ?? []).length === 0 ? (
        <EmptyState title="No applications yet" />
      ) : (
        data?.recent_applications?.map((application) => (
          <Card key={application.id}>
            <Text style={styles.ref}>{application.reference_number}</Text>
            <Text style={styles.cardTitle}>{application.product_name}</Text>
            <Text style={styles.meta}>
              {formatMoney(application.requested_amount, currency)} ·{' '}
              {formatStatus(application.status)}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.forestBright,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontFamily: 'Fraunces_700Bold',
    fontSize: 28,
  },
  subtitle: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  ref: {
    color: colors.forestBright,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  meta: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
});
