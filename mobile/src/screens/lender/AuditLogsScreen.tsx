import { useCallback } from 'react';
import { fetchAuditLogs } from '../../api/auditLogs';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatDate, formatStatus } from '../../lib/format';

export function AuditLogsScreen() {
  const loader = useCallback(() => fetchAuditLogs(), []);
  const { data, loading, refreshing, error, refresh } = useResource(loader);
  const logs = data?.data ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader title="Audit logs" subtitle="Recent activity" />
      <ErrorBanner message={error} />
      {logs.length === 0 ? (
        <EmptyState title="No audit events" description="Activity will appear here." />
      ) : (
        logs.map((log) => (
          <ListRow
            key={log.id}
            title={log.action ?? log.description ?? `Event #${log.id}`}
            subtitle={log.user_name ?? formatStatus(log.category)}
            meta={[
              log.entity_type,
              log.entity_id != null ? `#${log.entity_id}` : null,
              formatDate(log.created_at),
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        ))
      )}
    </Screen>
  );
}
