'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Factory as FactoryIcon,
  Package,
  UserCog,
  Zap,
  Sparkles,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';

const navigation = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Managers', href: '/owner/managers', icon: UserCog },
  { name: 'Energy', href: '/owner/energy', icon: Zap },
  { name: 'AI Factory Copilot', href: '/owner/ai-copilot', icon: Sparkles },
  { name: 'Reports', href: '/owner/reports', icon: FileBarChart },
  { name: 'Message Manager', href: '/owner/message-manager', icon: MessageSquare },
];


interface OwnerSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function OwnerSidebar({ collapsed = false, onToggle, isMobile = false, onCloseMobile }: OwnerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OW';

  return (
    <div
      className={cn(
        'bg-white border-r border-border flex flex-col h-full transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FactoryIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-primary text-sm block leading-none">FactoryMind</span>
              <span className="text-[10px] text-muted uppercase tracking-wider">Owner Portal</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-background text-muted shrink-0"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => isMobile && onCloseMobile?.()}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-background hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 shrink-0', collapsed ? 'mx-auto' : 'mr-3')} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>


      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border shrink-0">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Owner'}</p>
              <p className="text-xs text-muted truncate">Factory Owner</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
