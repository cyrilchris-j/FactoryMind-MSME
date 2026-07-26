'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Trash2,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch } from '@/lib/api';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export default function ManagerNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiPatch(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => apiPatch(`/api/notifications/${n.id}/read`)));
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-danger" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-accent" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getBgColor = (severity: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (severity) {
      case 'CRITICAL': return 'bg-[#D93025]/5';
      case 'WARNING': return 'bg-warning/5';
      case 'SUCCESS': return 'bg-accent/5';
      default: return 'bg-primary/5';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <ManagerLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted">You have {unreadCount} unread notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchNotifications} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="border-border">
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          </div>
        </div>

        <Card className="divide-y divide-border">
          {loading ? (
            <div className="py-12 text-center text-muted">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <Bell className="w-12 h-12 mx-auto mb-4 text-border" />
              <h3 className="text-lg font-medium text-foreground">All Caught Up!</h3>
              <p>You have no notifications at this time.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex gap-4 items-start transition-colors ${getBgColor(notif.severity, notif.is_read)} hover:bg-slate-50`}
              >
                <div className={`p-2 rounded-full shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                  {getIcon(notif.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${notif.is_read ? 'text-muted' : 'text-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted shrink-0 ml-4">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${notif.is_read ? 'text-[#9CA3AF]' : 'text-[#4B5563]'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium bg-border text-[#4B5563]">
                      {notif.type.replace('_', ' ')}
                    </Badge>
                    {!notif.is_read && (
                      <Badge className="text-[10px] font-medium bg-primary hover:bg-primary">
                        New
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                  {!notif.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notif.id)}
                      className="text-primary hover:text-primary hover:bg-blue-50/50 h-8"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark Read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </ManagerLayout>
  );
}
