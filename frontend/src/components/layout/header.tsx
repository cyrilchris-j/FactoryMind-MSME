'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Settings, User, Menu, LogOut, UserCircle, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  factoryName?: string;
  onMobileMenuClick?: () => void;
}

export function Header({ factoryName = 'Prime Auto Components', onMobileMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isOwner = user?.role === 'OWNER';

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center space-x-4">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-background text-muted"
          onClick={onMobileMenuClick}
          id="mobile-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-foreground">{factoryName}</h1>
          <p className="text-xs text-muted">{currentDate}</p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <Input
            type="search"
            placeholder="Search machines, orders, workers..."
            className="pl-9 bg-background border-border h-9 text-sm"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-2">
        {/* AI Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-accent/10 rounded-full">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-xs font-medium text-accent">AI Online</span>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background transition-colors"
            id="profile-avatar-btn"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">{user?.name}</p>
                <p className="text-xs text-muted">{user?.email}</p>
                <span className={cn(
                  'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
                  isOwner ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-700'
                )}>
                  {isOwner ? 'Factory Owner' : `${user?.department} Manager`}
                </span>
              </div>
              <div className="p-1.5">
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-muted" />
                  My Profile
                </Link>
                {isOwner && (
                  <Link
                    href="/owner/factory-profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-muted" />
                    Factory Profile
                  </Link>
                )}
                <Link
                  href={isOwner ? '/owner/settings' : '/manager/settings'}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
