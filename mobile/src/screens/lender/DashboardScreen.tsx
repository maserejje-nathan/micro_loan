import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fetchDashboard } from '../../api/dashboard';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatGrid } from '../../components/StatGrid';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatStatus } from '../../lib/format';
import { colors } from '../../theme/colors';
import type { LenderDashboard } from '../../types';

export function LenderDashboardScreen() {
  const { user } = useAuth();
  const loader = useCallback(() => fetchDashboard(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  const dashboard =
    data?.type === 'lender' ? (data as LenderDashboard) : null;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Lender workspace</Text>
        <Text style={styles.title}>
          {user?.organization?.name ?? 'Dashboard'}
        </Text>
        <Text style={styles.subtitle}>Signed in as {user?.name}</Text>
      </View>

      <ErrorBanner message={error} />

      {dashboard ? (
        <>
          <StatGrid
            items={[
              {
                label: 'Active loans',
                value: String(dashboard.stats.active_loans ?? 0),
              },
              {
                label: 'Pending apps',
                value: String(dashboard.stats.pending_applications ?? 0),
              },
              {
                label: 'Customers',
                value: String(dashboard.stats.total_customers ?? 0),
              },
              {
                label: 'Outstanding',
                value: formatMoney(
                  dashboard.stats.portfolio_outstanding,
                  dashboard.currency,
                ),
              },
              {
                label: 'Repaid this month',
                value: formatMoney(
                  dashboard.stats.repayments_this_month,
                  dashboard.currency,
                ),
                wide: true,
              },
            ]}
          />

          <SectionHeader title="Recent applications" />
          {(dashboard.recent_applications ?? []).length === 0 ? (
            <EmptyState
              title="No recent applications"
              description="New loan applications will show up here."
            />
          ) : (
            dashboard.recent_applications.map((application) => (
              <Card key={application.id}>
                <Text style={styles.ref}>{application.reference_number}</Text>
                <Text style={styles.cardTitle}>
                  {application.customer_name}
                </Text>
                <Text style={styles.meta}>
                  {application.product_name} ·{' '}
                  {formatMoney(
                    application.requested_amount,
                    dashboard.currency,
                  )}
                </Text>
                <Text style={styles.status}>
                  {formatStatus(application.status)}
                </Text>
              </Card>
            ))
          )}
        </>
      ) : (
        <EmptyState
          title="Dashboard unavailable"
          description="Could not load lender dashboard data."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4 },
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
  status: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
