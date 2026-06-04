import { formatAuditValue } from '@/lib/audit-log';
import { formatEnumLabel } from '@/lib/format-label';

type AuditLogChangesProps = {
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
};

export function AuditLogChanges({
    oldValues,
    newValues,
}: AuditLogChangesProps) {
    const keys = [
        ...new Set([
            ...Object.keys(oldValues ?? {}),
            ...Object.keys(newValues ?? {}),
        ]),
    ].sort();

    if (keys.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No field-level changes recorded.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-muted">
            <table className="w-full min-w-[320px] text-left text-xs">
                <thead>
                    <tr className="border-b bg-muted">
                        <th className="px-3 py-2 font-medium">Field</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">
                            Before
                        </th>
                        <th className="px-3 py-2 font-medium">After</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map((key) => {
                        const before = oldValues?.[key];
                        const after = newValues?.[key];
                        const changed =
                            JSON.stringify(before) !== JSON.stringify(after);

                        return (
                            <tr
                                key={key}
                                className="border-b border-border/50 last:border-0"
                            >
                                <td className="px-3 py-2 font-medium">
                                    {formatEnumLabel(key)}
                                </td>
                                <td
                                    className={`px-3 py-2 font-mono text-muted-foreground ${changed ? 'line-through' : ''}`}
                                >
                                    {formatAuditValue(before)}
                                </td>
                                <td
                                    className={`px-3 py-2 font-mono ${changed ? 'text-foreground' : 'text-muted-foreground'}`}
                                >
                                    {formatAuditValue(after)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
