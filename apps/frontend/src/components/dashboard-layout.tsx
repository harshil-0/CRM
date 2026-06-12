'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Handshake,
  CheckSquare,
  BarChart3,
  Settings,
  UserCog,
} from 'lucide-react';
import { AppShell, type NavItem, type CommandAction } from '@crm/ui';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@crm/ui';
import { NotificationPanel } from '@/components/notification-panel';
import { useUnreadCount } from '@/hooks/use-notifications';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
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

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Leads', href: '/leads', icon: <Users className="h-5 w-5" /> },
      { label: 'Customers', href: '/customers', icon: <UserCheck className="h-5 w-5" /> },
      { label: 'Deals', href: '/deals', icon: <Handshake className="h-5 w-5" /> },
      { label: 'Tasks', href: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    ];
    if (user?.permissions.includes('users:read')) {
      items.push({ label: 'Team', href: '/team', icon: <UserCog className="h-5 w-5" /> });
    }
    items.push({ label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> });
    return items;
  }, [user?.permissions]);

  const commandActions = useMemo<CommandAction[]>(() => [
    { id: 'dashboard', label: 'Go to Dashboard', group: 'Navigation', onSelect: () => router.push('/dashboard') },
    { id: 'leads', label: 'Go to Leads', group: 'Navigation', onSelect: () => router.push('/leads') },
    { id: 'customers', label: 'Go to Customers', group: 'Navigation', onSelect: () => router.push('/customers') },
    { id: 'deals', label: 'Go to Deals', group: 'Navigation', onSelect: () => router.push('/deals') },
    { id: 'tasks', label: 'Go to Tasks', group: 'Navigation', onSelect: () => router.push('/tasks') },
    { id: 'reports', label: 'Go to Reports', group: 'Navigation', onSelect: () => router.push('/reports') },
    { id: 'settings', label: 'Go to Settings', group: 'Navigation', onSelect: () => router.push('/settings') },
    ...(user?.permissions.includes('users:read')
      ? [{ id: 'team', label: 'Go to Team', group: 'Navigation', onSelect: () => router.push('/team') }]
      : []),
  ], [router, user?.permissions]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
          navItems,
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
          onLogout: handleLogout,
        }}
        commandActions={commandActions}
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
