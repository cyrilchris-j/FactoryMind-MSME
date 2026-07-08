'use client';

import { Bell, Search, Settings, User, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  factoryName?: string;
  onMobileMenuClick?: () => void;
}

export function Header({ factoryName = 'Kumar Manufacturing Ltd.', onMobileMenuClick }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMobileMenuClick}
        >
          <Menu className="w-5 h-5 text-[#6B7280]" />
        </Button>
        
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-[#1A1A1A]">{factoryName}</h1>
          <p className="text-xs text-[#6B7280]">{currentDate}</p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
          <Input
            type="search"
            placeholder="Search machines, orders, workers..."
            className="pl-10 bg-[#F8F9FA] border-[#E5E7EB]"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* AI Status */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#2E8B57]/10 rounded-full">
          <div className="w-2 h-2 bg-[#2E8B57] rounded-full animate-pulse" />
          <span className="text-xs font-medium text-[#2E8B57]">AI Online</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#6B7280]" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#D93025]">
            3
          </Badge>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" className="hidden sm:block">
          <Sun className="w-5 h-5 text-[#6B7280]" />
        </Button>

        {/* Profile */}
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5 text-[#6B7280]" />
        </Button>
      </div>
    </header>
  );
}
