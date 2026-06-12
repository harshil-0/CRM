'use client';

import * as React from 'react';
import { Search, Bell, Moon, Sun, Command } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Button } from '../components/button';
import { getInitials } from '@crm/utils';

export interface NavbarProps {
  onSearchClick?: () => void;
  onCommandPalette?: () => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function Navbar({
  onSearchClick,
  onCommandPalette,
  notificationCount,
  onNotificationsClick,
  user,
  theme = 'light',
  onThemeToggle,
  onLogout,
  className,
}: NavbarProps) {
  return (
    <header className={cn('flex items-center justify-between h-14 border-b border-border bg-background/80 backdrop-blur-sm px-6', className)}>
      <button
        onClick={onSearchClick || onCommandPalette}
        className="flex items-center gap-2 h-9 w-64 rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" onClick={onNotificationsClick}>
          <Bell className="h-4 w-4" />
          {(notificationCount ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {notificationCount! > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>

        {onThemeToggle && (
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout} className="hidden sm:inline-flex">
            Sign out
          </Button>
        )}

        {user && (
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <Avatar>
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
