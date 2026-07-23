export function hasPermission(
  permissions: string[] | undefined,
  permission: string,
  isSuperAdmin = false,
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (!permissions || permissions.length === 0) {
    return false;
  }

  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  required: string[],
  isSuperAdmin = false,
): boolean {
  return required.some((permission) =>
    hasPermission(permissions, permission, isSuperAdmin),
  );
}
