import { Notification } from '@/types/library';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isLoading?: boolean;
}

export function NotificationBell({ notifications, onMarkRead, onMarkAllRead, isLoading = false }: NotificationBellProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await onMarkAllRead();
      toast({
        title: 'All notifications marked as read',
        description: `${unreadCount} notifications have been marked as read.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to mark all as read',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isLoading}
              className="w-full justify-start text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-2" />
              {isLoading ? 'Marking all as read...' : 'Mark all as read'}
            </Button>
          </div>
        )}
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-4 cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                onClick={() => onMarkRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
