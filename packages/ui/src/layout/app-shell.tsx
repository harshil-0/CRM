'use client';

import * as React from 'react';
import { Sidebar, type SidebarProps } from './sidebar';
import { Navbar, type NavbarProps } from './navbar';
import { CommandPalette, type CommandAction } from '../components/command-palette';
import { cn } from '../lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  sidebar?: SidebarProps;
  navbar?: NavbarProps;
  commandActions?: CommandAction[];
  className?: string;
}

export function AppShell({ children, sidebar, navbar, commandActions, className }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      <Sidebar
        {...sidebar}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          {...navbar}
          onCommandPalette={() => setCommandOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} actions={commandActions} />
    </div>
  );
}
