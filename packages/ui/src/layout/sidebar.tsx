'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Handshake,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Leads', href: '/leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Customers', href: '/customers', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'Deals', href: '/deals', icon: <Handshake className="h-5 w-5" /> },
  { label: 'Tasks', href: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
  { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export interface SidebarProps {
  appName?: string;
  logoUrl?: string | null;
  navItems?: NavItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  appName = 'CRM',
  logoUrl,
  navItems = defaultNavItems,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex items-center h-14 border-b border-border px-4', collapsed && 'justify-center px-2')}>
        {logoUrl ? (
          <img src={logoUrl} alt={appName} className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {appName.charAt(0)}
          </div>
        )}
        {!collapsed && <span className="ml-3 font-semibold text-sm truncate">{appName}</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-sidebar-accent-foreground bg-sidebar-accent'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="relative z-10 ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {onCollapsedChange && (
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </aside>
  );
}
