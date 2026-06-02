'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { VerticalConfig } from '@/lib/verticals';

const VerticalContext = createContext<VerticalConfig | null>(null);

export function VerticalProvider({
  config,
  children,
}: {
  config: VerticalConfig;
  children: ReactNode;
}) {
  return (
    <VerticalContext.Provider value={config}>
      {children}
    </VerticalContext.Provider>
  );
}

export function useVerticalConfig(): VerticalConfig {
  const ctx = useContext(VerticalContext);
  if (!ctx) throw new Error('useVerticalConfig must be used within VerticalProvider');
  return ctx;
}
