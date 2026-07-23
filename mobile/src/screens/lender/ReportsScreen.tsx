import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fetchReports } from '../../api/reports';
import { useAuth } from '../../auth/AuthContext';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatGrid } from '../../components/StatGrid';
import { useResource } from '../../hooks/useResource';
import { formatMoney } from '../../lib/format';
import { colors } from '../../theme/colors';

export function ReportsScreen() {
  const { user } = useAuth();
  const loader = useCallback(() => fetchReports(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const currency = data?.currency ?? user?.organization?.currency ?? 'UGX';
  const portfolio = data?.portfolio ?? {};

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="Reports"
        subtitle="Portfolio snapshot from the API"
      />
      <ErrorBanner message={error} />
      <StatGrid
        items={[
          {
            label: 'Outstanding',
            value: formatMoney(Number(portfolio.outstanding ?? 0), currency),
          },
          {
            label: 'Active loans',
            value: String(portfolio.active_loans ?? 0),
          },
          {
            label: 'Total disbursed',
            value: formatMoney(
              Number(portfolio.total_disbursed ?? 0),
              currency,
            ),
          },
          {
            label: 'Repaid month',
            value: formatMoney(
              Number(portfolio.collected_this_month ?? 0),
              currency,
            ),
          },
          {
            label: 'Overdue installments',
            value: String(portfolio.overdue_installments ?? 0),
            wide: true,
          },
        ]}
      />
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Detailed exports remain on the web reports page.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    paddingTop: 4,
  },
  noteText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
});
