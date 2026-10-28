export const ROLES = ['owner', 'admin', 'sales', 'ops', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  sales: 'Sales',
  ops: 'Operations',
  viewer: 'Viewer',
}
