import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
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
import { colors } from '../../theme/colors';
import type { AdminDashboard } from '../../types';

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const loader = useCallback(() => fetchDashboard(true), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  const dashboard = data?.type === 'admin' ? (data as AdminDashboard) : null;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <Text style={styles.eyebrow}>Platform admin</Text>
      <Text style={styles.title}>Avango Credit Platform</Text>
      <Text style={styles.subtitle}>Signed in as {user?.name}</Text>
      <ErrorBanner message={error} />

      {dashboard ? (
        <>
          <StatGrid
            items={[
              {
                label: 'Organizations',
                value: String(dashboard.stats.organizations ?? 0),
              },
              {
                label: 'Lender users',
                value: String(dashboard.stats.users ?? 0),
              },
              {
                label: 'Active subs',
                value: String(dashboard.stats.active_subscriptions ?? 0),
              },
              {
                label: 'Open invoices',
                value: String(dashboard.stats.open_invoices ?? 0),
              },
              {
                label: 'MRR',
                value: (dashboard.stats.mrr ?? 0).toLocaleString(),
              },
              {
                label: 'Plans',
                value: String(dashboard.stats.plans ?? 0),
              },
            ]}
          />
          <SectionHeader title="Recent organizations" />
          {(dashboard.recent_organizations ?? []).length === 0 ? (
            <EmptyState title="No organizations yet" />
          ) : (
            dashboard.recent_organizations.map((organization) => (
              <Card key={organization.id}>
                <Text style={styles.ref}>{organization.slug}</Text>
                <Text style={styles.cardTitle}>{organization.name}</Text>
                <Text style={styles.meta}>
                  {organization.users_count} users
                  {organization.created_at
                    ? ` · ${organization.created_at}`
                    : ''}
                </Text>
              </Card>
            ))
          )}
        </>
      ) : (
        <EmptyState title="Admin dashboard unavailable" />
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
