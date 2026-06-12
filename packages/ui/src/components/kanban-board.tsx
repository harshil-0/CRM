'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Badge } from './badge';

export interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  color?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onItemClick?: (item: KanbanItem, columnId: string) => void;
  className?: string;
}

export function KanbanBoard({ columns, onItemClick, className }: KanbanBoardProps) {
  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              {column.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />}
              <h3 className="text-sm font-medium">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {column.items.length}
              </span>
            </div>
          </div>
          <div className="space-y-2 min-h-[200px] rounded-xl bg-muted/30 p-2">
            {column.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => onItemClick?.(item, column.id)}
                className="rounded-lg border border-border bg-card p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium">{item.title}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>}
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'secondary'} className="mt-2">
                    {item.badge}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
