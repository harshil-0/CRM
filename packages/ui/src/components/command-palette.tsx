'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, LayoutDashboard, Users, CheckSquare, Handshake, BarChart3, Settings } from 'lucide-react';
import { Dialog, DialogContent } from './dialog';
import { cn } from '../lib/utils';

export interface CommandAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  group?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions?: CommandAction[];
}

const defaultActions: CommandAction[] = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'leads', label: 'Go to Leads', icon: <Users className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'tasks', label: 'Go to Tasks', icon: <CheckSquare className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'deals', label: 'Go to Deals', icon: <Handshake className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'reports', label: 'Go to Reports', icon: <BarChart3 className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'settings', label: 'Go to Settings', icon: <Settings className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
];

export function CommandPalette({ open, onOpenChange, actions = defaultActions }: CommandPaletteProps) {
  const groups = [...new Set(actions.map((a) => a.group || 'Actions'))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input placeholder="Type a command or search..." className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group} heading={group}>
                {actions
                  .filter((a) => (a.group || 'Actions') === group)
                  .map((action) => (
                    <Command.Item
                      key={action.id}
                      value={action.label}
                      onSelect={() => {
                        action.onSelect();
                        onOpenChange(false);
                      }}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none',
                        'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      )}
                    >
                      {action.icon}
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          {action.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
