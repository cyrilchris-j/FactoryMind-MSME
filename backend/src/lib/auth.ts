export type UserRole = 'factory_owner' | 'production_manager' | 'maintenance_engineer' | 'inventory_manager' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  factoryId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const rolePermissions: Record<UserRole, string[]> = {
  factory_owner: [
    'dashboard:view',
    'ai_copilot:view',
    'production:view',
    'production:edit',
    'inventory:view',
    'inventory:edit',
    'maintenance:view',
    'maintenance:edit',
    'energy:view',
    'sales:view',
    'sales:edit',
    'workers:view',
    'workers:edit',
    'reports:view',
    'reports:edit',
    'analytics:view',
    'settings:view',
    'settings:edit',
  ],
  production_manager: [
    'dashboard:view',
    'ai_copilot:view',
    'production:view',
    'production:edit',
    'inventory:view',
    'maintenance:view',
    'energy:view',
    'workers:view',
    'reports:view',
    'analytics:view',
  ],
  maintenance_engineer: [
    'dashboard:view',
    'ai_copilot:view',
    'maintenance:view',
    'maintenance:edit',
    'energy:view',
    'reports:view',
  ],
  inventory_manager: [
    'dashboard:view',
    'ai_copilot:view',
    'inventory:view',
    'inventory:edit',
    'production:view',
    'reports:view',
    'analytics:view',
  ],
  worker: [
    'dashboard:view',
    'production:view',
    'maintenance:view',
  ],
  admin: [
    '*',
  ],
};

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  const permissions = rolePermissions[user.role];
  return permissions.includes('*') || permissions.includes(permission);
}

export function canAccessModule(user: User | null, module: string): boolean {
  if (!user) return false;
  
  const permission = `${module}:view`;
  return hasPermission(user, permission);
}
