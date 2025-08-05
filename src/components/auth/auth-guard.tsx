'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AuthForm } from './auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuth(true);
    } else if (isAuthenticated) {
      setShowAuth(false);
    }
  }, [loading, isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // Force a page refresh to ensure proper state sync
    window.location.reload();
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show authentication form if user is not authenticated
  if (showAuth && !isAuthenticated) {
    return (
      <AuthForm 
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // Show protected content if user is authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Please sign in to continue</p>
      </div>
    </div>
  );
}