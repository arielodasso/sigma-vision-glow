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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRoles([]);
        setPermissions([]);
        return;
      }
      const [rolesRes, permsRes] = await Promise.all([
        supabase.rpc('get_my_roles'),
        supabase.rpc('get_my_permissions'),
      ]);
      if (rolesRes.error) throw rolesRes.error;
      if (permsRes.error) throw permsRes.error;

      setRoles((rolesRes.data as AppRole[]) ?? []);
      setPermissions((permsRes.data as string[]) ?? []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') return;
      setLoading(true);
      setTimeout(fetchPermissions, 0);
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