'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@crm/ui';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@crm/ui';
import { NotificationPanel } from '@/components/notification-panel';
import { useUnreadCount } from '@/hooks/use-notifications';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: unread } = useUnreadCount();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <AppShell
        sidebar={{
          appName: process.env.NEXT_PUBLIC_APP_NAME || 'CRM',
          logoUrl: process.env.NEXT_PUBLIC_APP_LOGO_URL,
        }}
        navbar={{
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          theme: theme === 'dark' ? 'dark' : 'light',
          onThemeToggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
          notificationCount: unread?.count,
          onNotificationsClick: () => setNotificationsOpen((v) => !v),
        }}
      >
        {children}
      </AppShell>
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }}
      />
    </>
  );
}
