import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '../lib/useFocusEffect';
import { fetchDashboard } from '../api/dashboard';
import { useAuth } from '../auth/AuthContext';
import type { Dashboard } from '../types';

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading && !dashboard) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1F6B57" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Lender workspace</Text>
          <Text style={styles.title}>{user?.organization?.name ?? 'Dashboard'}</Text>
          <Text style={styles.subtitle}>Signed in as {user?.name}</Text>
        </View>
        <Pressable style={styles.signOut} onPress={() => void signOut()}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Active loans"
              value={String(dashboard.stats.active_loans)}
            />
            <StatCard
              label="Pending apps"
              value={String(dashboard.stats.pending_applications)}
            />
            <StatCard
              label="Customers"
              value={String(dashboard.stats.total_customers)}
            />
            <StatCard
              label="Outstanding"
              value={formatMoney(
                dashboard.stats.portfolio_outstanding,
                dashboard.currency,
              )}
            />
            <StatCard
              label="Repaid this month"
              value={formatMoney(
                dashboard.stats.repayments_this_month,
                dashboard.currency,
              )}
              wide
            />
          </View>

          <Text style={styles.sectionTitle}>Recent applications</Text>
          {dashboard.recent_applications.length === 0 ? (
            <Text style={styles.empty}>No recent applications yet.</Text>
          ) : (
            dashboard.recent_applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Text style={styles.applicationRef}>
                    {application.reference_number}
                  </Text>
                  <Text style={styles.applicationStatus}>
                    {application.status.replaceAll('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.applicationCustomer}>
                  {application.customer_name}
                </Text>
                <Text style={styles.applicationMeta}>
                  {application.product_name} ·{' '}
                  {formatMoney(application.requested_amount, dashboard.currency)}
                </Text>
              </View>
            ))
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.statCard, wide && styles.statCardWide]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  content: {
    padding: 20,
    paddingTop: 56,
    gap: 14,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#1F6B57',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#14201C',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#5B6B63',
    fontSize: 14,
  },
  signOut: {
    borderWidth: 1,
    borderColor: '#C9D5CE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  signOutText: {
    color: '#24342E',
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#B42318',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAE5',
    gap: 8,
  },
  statCardWide: {
    width: '100%',
  },
  statLabel: {
    color: '#5B6B63',
    fontSize: 13,
  },
  statValue: {
    color: '#14201C',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 8,
    color: '#14201C',
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    color: '#5B6B63',
    fontSize: 14,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAE5',
    gap: 4,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  applicationRef: {
    color: '#1F6B57',
    fontSize: 13,
    fontWeight: '700',
  },
  applicationStatus: {
    color: '#5B6B63',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  applicationCustomer: {
    color: '#14201C',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationMeta: {
    color: '#5B6B63',
    fontSize: 13,
  },
});
