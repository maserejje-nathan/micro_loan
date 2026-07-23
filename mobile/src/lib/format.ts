export function formatMoney(
  amount: number | null | undefined,
  currency = 'UGX',
): string {
  if (amount == null || Number.isNaN(Number(amount))) {
    return `— ${currency}`;
  }

  return `${Number(amount).toLocaleString()} ${currency}`;
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) {
    return 'Unknown';
  }

  return status.replaceAll('_', ' ');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function displayName(
  entity:
    | {
        full_name?: string;
        name?: string;
        first_name?: string;
        last_name?: string;
      }
    | null
    | undefined,
  fallback = 'Unknown',
): string {
  if (!entity) {
    return fallback;
  }

  if (entity.full_name) {
    return entity.full_name;
  }

  if (entity.name) {
    return entity.name;
  }

  const combined = [entity.first_name, entity.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return combined || fallback;
}
