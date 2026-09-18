import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface PermissionsState {
  roles: AppRole[];
  permissions: string[];
  loading: boolean;
  isSuperAdmin: boolean;
  isBackoffice: boolean;
  isStaff: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refetch: () => Promise<void>;
}

export function usePermissions(): PermissionsState {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const [{ data: rolesData }, { data: permsData }] = await Promise.all([
        supabase.rpc('get_my_roles'),
        supabase.rpc('get_my_permissions'),
      ]);

      setRoles((rolesData as AppRole[]) ?? []);
      setPermissions((permsData as string[]) ?? []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPermissions();
    });

    return () => subscription.unsubscribe();
  }, []);

  const isSuperAdmin = roles.includes('superadmin');
  const isBackoffice = roles.includes('superadmin') || roles.includes('admin');
  const isStaff = isBackoffice || roles.includes('moderator') || roles.includes('empleado');

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyRole = (requiredRoles: AppRole[]): boolean => {
    return roles.some((role) => requiredRoles.includes(role));
  };

  return {
    roles,
    permissions,
    loading,
    isSuperAdmin,
    isBackoffice,
    isStaff,
    hasPermission,
    hasAnyRole,
    refetch: fetchPermissions,
  };
}

export function useRoleGuard(allowedRoles: AppRole[], fallback?: React.ReactNode): React.ReactNode {
  const { roles, loading } = usePermissions();
  const hasAccess = allowedRoles.some((role) => roles.includes(role));

  if (loading) return null;
  if (!hasAccess) return fallback ?? null;

  return null;
}