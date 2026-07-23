import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fetchSystem } from '../../api/admin';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatStatus } from '../../lib/format';
import { colors } from '../../theme/colors';

export function SystemScreen() {
  const loader = useCallback(() => fetchSystem(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);

  if (loading && !data) {
    return <LoadingState />;
  }

  const healthEntries = Object.entries(data ?? {}).filter(
    ([key, value]) =>
      !key.startsWith('platform_') &&
      !key.startsWith('audit_') &&
      key !== 'recent_audit_logs' &&
      (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'),
  );

  const platformEntries = Object.entries(data ?? {}).filter(([key, value]) =>
    key.startsWith('platform_') &&
    (typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'),
  );

  const auditEntries = Object.entries(data ?? {}).filter(([key, value]) =>
    key.startsWith('audit_') &&
    (typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'),
  );

  const recentLogs = Array.isArray(data?.recent_audit_logs)
    ? data.recent_audit_logs
    : [];

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title="System"
        subtitle="Platform health and recent activity"
      />
      <ErrorBanner message={error} />

      <Card>
        <Text style={styles.section}>Health</Text>
        <View style={styles.grid}>
          {healthEntries.length === 0 ? (
            <EmptyState title="No health data" />
          ) : (
            healthEntries.map(([key, value]) => (
              <DetailField
                key={key}
                label={key.replaceAll('_', ' ')}
                value={String(value)}
              />
            ))
          )}
        </View>
      </Card>

      {platformEntries.length > 0 ? (
        <Card>
          <Text style={styles.section}>Platform</Text>
          <View style={styles.grid}>
            {platformEntries.map(([key, value]) => (
              <DetailField
                key={key}
                label={key.replace(/^platform_/, '').replaceAll('_', ' ')}
                value={String(value)}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {auditEntries.length > 0 ? (
        <Card>
          <Text style={styles.section}>Audit</Text>
          <View style={styles.grid}>
            {auditEntries.map(([key, value]) => (
              <DetailField
                key={key}
                label={key.replace(/^audit_/, '').replaceAll('_', ' ')}
                value={String(value)}
              />
            ))}
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Recent audit logs" />
      {recentLogs.length === 0 ? (
        <EmptyState title="No recent audit logs" />
      ) : (
        recentLogs.slice(0, 10).map((log, index) => {
          const id = typeof log.id === 'number' ? log.id : index;
          const action =
            typeof log.action === 'string'
              ? log.action
              : typeof log.description === 'string'
                ? log.description
                : 'Event';
          const actor =
            typeof log.user_name === 'string'
              ? log.user_name
              : typeof log.organization_name === 'string'
                ? log.organization_name
                : undefined;

          return (
            <ListRow
              key={id}
              title={formatStatus(action)}
              subtitle={actor}
              meta={
                typeof log.created_at === 'string' ? log.created_at : undefined
              }
            />
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    marginBottom: 4,
  },
  grid: { gap: 14 },
});
