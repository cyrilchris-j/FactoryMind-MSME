'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Package, 
  Wrench, 
  Zap,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'inventory' | 'maintenance' | 'energy' | 'production' | 'worker' | 'ai';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
  action?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'N-001',
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Plastic Pellets (RM-006) is below reorder level. Current: 45kg, Reorder: 100kg',
    severity: 'warning',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    action: 'View Inventory',
  },
  {
    id: 'N-002',
    type: 'maintenance',
    title: 'Maintenance Due',
    message: 'HVAC-02 requires immediate maintenance. Health score dropped to 45%',
    severity: 'critical',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    action: 'Schedule Maintenance',
  },
  {
    id: 'N-003',
    type: 'energy',
    title: 'Energy Spike Detected',
    message: 'Unusual energy consumption detected between 2-4 PM. Usage increased by 18%',
    severity: 'warning',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    action: 'View Energy Report',
  },
  {
    id: 'N-004',
    type: 'production',
    title: 'Order Delayed',
    message: 'PO-004 (Precision Part D) is delayed. Only 50% completed with deadline approaching',
    severity: 'warning',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    action: 'View Order',
  },
  {
    id: 'N-005',
    type: 'worker',
    title: 'Worker Overload',
    message: 'Vijay Kumar (W-005) has 25 overtime hours this week. Consider redistributing tasks',
    severity: 'warning',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: true,
    action: 'View Worker',
  },
  {
    id: 'N-006',
    type: 'ai',
    title: 'AI Insight Available',
    message: 'New AI-generated insights for production optimization are ready to review',
    severity: 'info',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    action: 'View Insights',
  },
];

const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    inventory: Package,
    maintenance: Wrench,
    energy: Zap,
    production: TrendingUp,
    worker: Users,
    ai: Bell,
  };
  return icons[type] || Bell;
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'bg-[#1F3A5F]/10 text-[#1F3A5F]',
    warning: 'bg-[#F4B400]/10 text-[#F4B400]',
    critical: 'bg-[#D93025]/10 text-[#D93025]',
  };
  return colors[severity] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

const getSeverityBorder = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'border-l-[#1F3A5F]',
    warning: 'border-l-[#F4B400]',
    critical: 'border-l-[#D93025]',
  };
  return colors[severity] || 'border-l-[#4F6D7A]';
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <Card className="relative w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="font-semibold text-[#1A1A1A]">Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-[#D93025] text-white">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-[#E5E7EB] flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-[#1F3A5F]' : ''}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-[#1F3A5F]' : ''}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-[#6B7280]">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#E5E7EB] border-l-4 ${getSeverityBorder(notification.severity)} ${
                    !notification.read ? 'bg-[#F8F9FA]' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(notification.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-medium text-[#1A1A1A] ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-[#6B7280] mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="w-3 h-3 text-[#6B7280]" />
                            <span className="text-xs text-[#6B7280]">
                              {notification.timestamp.toLocaleString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {notification.action && (
                        <Button variant="outline" size="sm" className="mt-3">
                          {notification.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <Button variant="outline" className="w-full">
            View All Notifications
          </Button>
        </div>
      </Card>
    </div>
  );
}
