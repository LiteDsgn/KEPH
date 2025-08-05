'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <AuthForm onSuccess={handleAuthSuccess} />
  );
}