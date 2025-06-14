'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { loading, initialized, initialize } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
    
    // Force render after a short delay to prevent infinite loading
    const forceRenderTimeout = setTimeout(() => {
      setForceRender(true);
    }, 4000); // Force render after 4 seconds max
    
    return () => clearTimeout(forceRenderTimeout);
  }, [initialize]);

  // Don't render anything until component is mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading only during initial auth check and only if not initialized
  // But force render after timeout to prevent infinite loading
  if (!initialized && loading && !forceRender) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Always render children - app works for both authenticated and free users
  return <>{children}</>;
}