'use client';

import { createContext, useContext } from 'react';

export type TenantRole = 'owner' | 'admin' | 'member';

export interface Tenant {
  orgId: string;
  orgName: string;
  role: TenantRole;
  plan: string;
}

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: Tenant;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): Tenant {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant doit être utilisé dans un <TenantProvider>.');
  return ctx;
}