'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  History,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Factory as FactoryIcon,
  Package,
  Wrench,
  ShieldCheck,
  Users,
  Zap,
  ShoppingCart,
  UploadCloud,
  BarChart3,
  Target,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';

const COMPONENT_NAMES: Record<string, string> = {
  BRAKE_DISC: 'Brake Disc',
  BRAKE_CALIPER: 'Brake Caliper',
  BRAKE_PAD: 'Brake Pad',
  PISTON: 'Piston',
  CALIPER_BRACKET: 'Caliper Bracket',
  GUIDE_PIN: 'Guide Pin',
  SEAL_RING: 'Seal Ring',
  DUST_BOOT: 'Dust Boot',
  BOLT_KIT: 'Bolt Kit',
  WEAR_SENSOR: 'Wear Sensor',
};

const allNavigation = {
  Inventory: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Component Inventory', href: '/manager/inventory', icon: Package },
    { name: 'Add Stock', href: '/manager/inventory?tab=add', icon: Plus },
    { name: 'Upload Excel/CSV', href: '/manager/inventory?tab=upload', icon: UploadCloud },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Production: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Component: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'My Component', href: '/manager/my-component', icon: Target },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Maintenance: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Maintenance Entry', href: '/manager/maintenance', icon: Wrench },
    { name: 'Machine Status', href: '/manager/maintenance?tab=machines', icon: Wrench },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Quality: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Quality Entry', href: '/manager/quality', icon: ShieldCheck },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Workforce: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Attendance Entry', href: '/manager/workforce', icon: Users },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Energy: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Energy Entry', href: '/manager/energy', icon: Zap },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
  Orders: [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Order Entry', href: '/manager/orders', icon: ShoppingCart },
    { name: 'Submission History', href: '/manager/history', icon: History },
    { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
  ],
}

const defaultNavigation = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
  { name: 'Submission History', href: '/manager/history', icon: History },
  { name: 'Message Owner', href: '/manager/message-owner', icon: MessageSquare },
]


interface ManagerSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function ManagerSidebar({ collapsed = false, onToggle, isMobile = false, onCloseMobile }: ManagerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MG';

  const componentCode = user?.componentCode;
  const isComponentManager = !!componentCode;
  const componentName = componentCode ? (COMPONENT_NAMES[componentCode] || componentCode) : '';

  const deptColor: Record<string, string> = {
    Production: 'bg-blue-600',
    Inventory: 'bg-amber-600',
    Maintenance: 'bg-orange-600',
    Energy: 'bg-yellow-600',
    Sales: 'bg-green-600',
    Workforce: 'bg-purple-600',
  };

  const rawDept = user?.department || 'Production';
  const dept = rawDept === 'Sales' ? 'Orders' : rawDept;
  const accentColor = deptColor[rawDept] || 'bg-primary';
  const navigation = isComponentManager
    ? allNavigation['Component']
    : (allNavigation[dept as keyof typeof allNavigation] || defaultNavigation);

  const roleLabel = isComponentManager ? `${componentName} Manager` : `${dept} Manager`;
  const machineLabel = user?.machineNumber ? `Machine ${user.machineNumber}` : 'No Machine Assigned';

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
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accentColor)}>
              <FactoryIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-primary text-sm block leading-none">FactoryMind</span>
              <span className="text-[10px] text-muted uppercase tracking-wider">Manager Portal</span>
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

      {/* Department Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-background rounded-lg border border-border">
          <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
            {isComponentManager ? 'Component' : 'Department'}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {isComponentManager ? componentName : dept}
          </p>
        </div>
      )}

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
                      ? `${accentColor} text-white`
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
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0', accentColor)}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Manager'}</p>
              <p className="text-xs text-muted truncate">{machineLabel}</p>
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
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold', accentColor)}>
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
