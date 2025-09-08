
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { Skeleton } from './ui/skeleton';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
        <div className="flex flex-col min-h-screen bg-background p-4 md:p-8">
            <Skeleton className="h-16 mb-8" />
            <div className="max-w-4xl mx-auto w-full grid gap-8">
                <Skeleton className="h-48" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
