'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Tenant,
  TenantBranding,
  TenantPlan,
  TenantSubscription,
  TenantUser,
  TenantModuleConfig,
  TenantUsage,
  TenantRole,
} from '@/types';
import { repository } from '@/lib/db/repository';
import { applyTenantBrandingToDom } from '@/lib/engines/brandingEngine';
import { hasPermission, canAccessModule, TenantPermission } from '@/lib/engines/rbacEngine';
import { getOrCreateCurrentUsage } from '@/lib/engines/tenantContextEngine';

interface TenantContextType {
  currentTenant: Tenant | null;
  currentBranding: TenantBranding | null;
  currentUser: TenantUser | null;
  currentPlan: TenantPlan | null;
  currentSubscription: TenantSubscription | null;
  currentUsage: TenantUsage | null;
  moduleConfig: TenantModuleConfig | null;
  userTenants: Tenant[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  updateBranding: (branding: Partial<TenantBranding>) => Promise<void>;
  toggleModule: (moduleId: string, enabled: boolean) => Promise<void>;
  isModuleEnabled: (moduleId: string) => boolean;
  hasRole: (role: TenantRole) => boolean;
  checkPermission: (permission: TenantPermission) => boolean;
  refreshTenantData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'watech_active_tenant_id';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentBranding, setCurrentBranding] = useState<TenantBranding | null>(null);
  const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TenantPlan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<TenantSubscription | null>(null);
  const [currentUsage, setCurrentUsage] = useState<TenantUsage | null>(null);
  const [moduleConfig, setModuleConfig] = useState<TenantModuleConfig | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTenant = useCallback(async (tenantId?: string) => {
    try {
      setIsLoading(true);
      const allTenants = await repository.getTenants();
      setUserTenants(allTenants);

      if (allTenants.length === 0) {
        setIsLoading(false);
        return;
      }

      // Priority: supplied tenantId -> saved localStorage -> primary super admin tenant -> first tenant
      let activeId = tenantId;
      if (!activeId && typeof window !== 'undefined') {
        activeId = localStorage.getItem(TENANT_STORAGE_KEY) || undefined;
      }

      let matchedTenant = allTenants.find(t => t.id === activeId);
      if (!matchedTenant) {
        matchedTenant = allTenants.find(t => t.isPlatformSuperAdminTenant) || allTenants[0];
      }

      if (matchedTenant) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TENANT_STORAGE_KEY, matchedTenant.id);
        }
        setCurrentTenant(matchedTenant);

        // Load branding
        const branding = await repository.getTenantBranding(matchedTenant.id);
        setCurrentBranding(branding || null);
        applyTenantBrandingToDom(branding || null);

        // Load subscription & plan
        const sub = await repository.getTenantSubscription(matchedTenant.id);
        setCurrentSubscription(sub || null);

        const planId = sub?.planId || matchedTenant.planId;
        const plans = await repository.getTenantPlans();
        const matchedPlan = plans.find(p => p.id === planId) || plans[0] || null;
        setCurrentPlan(matchedPlan);

        // Load current user (defaulting to first user of this tenant or super-admin)
        const tenantUsers = await repository.getTenantUsers(matchedTenant.id);
        let user = tenantUsers.find(u => u.isPlatformSuperAdmin) || tenantUsers[0];
        if (!user) {
          user = {
            id: `user-${matchedTenant.id}-admin`,
            tenantId: matchedTenant.id,
            email: matchedTenant.contactEmail,
            fullName: `${matchedTenant.name} Administrator`,
            role: 'owner',
            status: 'active',
            isPlatformSuperAdmin: Boolean(matchedTenant.isPlatformSuperAdminTenant),
            createdAt: new Date().toISOString(),
          };
          await repository.saveTenantUser(user);
        }
        setCurrentUser(user);

        // Load module config
        let mcfg = await repository.getTenantModuleConfig(matchedTenant.id);
        if (!mcfg) {
          mcfg = {
            id: `mcfg-${matchedTenant.id}`,
            tenantId: matchedTenant.id,
            enabledModules: {},
            updatedAt: new Date().toISOString(),
          };
        }
        setModuleConfig(mcfg);

        // Load usage
        const usage = await getOrCreateCurrentUsage(matchedTenant.id);
        setCurrentUsage(usage);
      }
    } catch (err) {
      console.error('Failed to load tenant context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const switchTenant = async (tenantId: string) => {
    await loadTenant(tenantId);
  };

  const updateBranding = async (newBrandingData: Partial<TenantBranding>) => {
    if (!currentTenant) return;
    const existing = currentBranding || {
      id: `brand-${currentTenant.id}`,
      tenantId: currentTenant.id,
      companyName: currentTenant.name,
      primaryColor: '#2563eb',
      secondaryColor: '#4f46e5',
      accentColor: '#10b981',
      fontStack: 'Inter, sans-serif',
      footerText: `Powered by ${currentTenant.name}`,
      supportEmail: currentTenant.contactEmail,
      updatedAt: new Date().toISOString(),
    };

    const updated: TenantBranding = {
      ...existing,
      ...newBrandingData,
      updatedAt: new Date().toISOString(),
    };

    await repository.saveTenantBranding(updated);
    setCurrentBranding(updated);
    applyTenantBrandingToDom(updated);
  };

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    if (!currentTenant) return;
    const existing = moduleConfig || {
      id: `mcfg-${currentTenant.id}`,
      tenantId: currentTenant.id,
      enabledModules: {},
      updatedAt: new Date().toISOString(),
    };

    const updated: TenantModuleConfig = {
      ...existing,
      enabledModules: {
        ...existing.enabledModules,
        [moduleId]: enabled,
      },
      updatedAt: new Date().toISOString(),
    };

    await repository.saveTenantModuleConfig(updated);
    setModuleConfig(updated);
  };

  const isSuperAdmin = Boolean(currentUser?.isPlatformSuperAdmin || currentTenant?.isPlatformSuperAdminTenant);

  const isModuleEnabled = (moduleId: string): boolean => {
    if (isSuperAdmin) return true;
    const userRole = currentUser?.role || 'viewer';
    return canAccessModule(userRole, moduleId, moduleConfig || undefined, isSuperAdmin);
  };

  const hasRole = (role: TenantRole): boolean => {
    if (isSuperAdmin) return true;
    if (!currentUser) return false;
    const hierarchy: TenantRole[] = ['viewer', 'employee', 'manager', 'admin', 'owner'];
    const userIndex = hierarchy.indexOf(currentUser.role);
    const requiredIndex = hierarchy.indexOf(role);
    return userIndex >= requiredIndex;
  };

  const checkPermission = (permission: TenantPermission): boolean => {
    if (isSuperAdmin) return true;
    const userRole = currentUser?.role || 'viewer';
    return hasPermission(userRole, permission, isSuperAdmin);
  };

  const refreshTenantData = async () => {
    await loadTenant(currentTenant?.id);
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        currentBranding,
        currentUser,
        currentPlan,
        currentSubscription,
        currentUsage,
        moduleConfig,
        userTenants,
        isSuperAdmin,
        isLoading,
        switchTenant,
        updateBranding,
        toggleModule,
        isModuleEnabled,
        hasRole,
        checkPermission,
        refreshTenantData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
