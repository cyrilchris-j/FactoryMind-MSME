'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

const severityConfig = {
  CRITICAL: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
    label: 'Critical',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
    label: 'Warning',
  },
  INFO: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
    label: 'Info',
  },
  SUCCESS: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    dot: 'bg-green-500',
    label: 'Success',
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data: any = await apiGet('/api/notifications');
      const formatted = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: d.id,
        type: d.type || 'INFO',
        title: d.title || '',
        message: d.message || '',
        severity: d.severity || 'INFO',
        is_read: d.isRead || d.is_read || false,
        created_at: d.createdAt || d.created_at || '',
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiPatch(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;
    try {
      await Promise.all(unreadIds.map(id => apiPatch(`/api/notifications/${id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-background text-muted transition-colors"
        id="notification-bell-btn"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-border mx-auto mb-2" />
                <p className="text-sm text-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = severityConfig[notif.severity] || severityConfig.INFO;
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markRead(notif.id)}
                    className={cn(
                      'flex gap-3 p-4 border-b border-border last:border-0 cursor-pointer hover:bg-background transition-colors group',
                      !notif.is_read && 'bg-[#F8FAFF]'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium', !notif.is_read ? 'text-foreground' : 'text-muted')}>
                          {notif.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', config.bg, config.color)}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-muted">{timeAgo(notif.created_at)}</span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-border bg-background">
            <Link
              href={user?.role === 'MANAGER' ? '/manager/notifications' : '/owner/notifications'}
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-primary font-medium hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
