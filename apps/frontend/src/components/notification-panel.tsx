'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { Button, Badge, Skeleton } from '@crm/ui';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { formatDateTime } from '@crm/utils';
import { cn } from '@crm/ui';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (!open) return null;

  const handleClick = (id: string, link: string | null, isRead: boolean) => {
    if (!isRead) markRead.mutate(id);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-6 top-14 z-50 w-96 max-h-[480px] rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-medium text-sm">Notifications</span>
            {(unread?.count ?? 0) > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {unread?.count}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !notifications?.length ? (
            <p className="text-sm text-muted-foreground text-center py-12">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.link, n.isRead)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors',
                  !n.isRead && 'bg-muted/20',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export function NotificationBell({ onClick, count }: { onClick: () => void; count?: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="h-4 w-4" />
      {(count ?? 0) > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
          {count! > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
}
