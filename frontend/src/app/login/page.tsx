'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Factory Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1F3A5F] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <Factory className="w-24 h-24 text-white/90" />
          </div>
          <h1 className="text-4xl font-bold mb-4">FactoryMind AI</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            AI-Powered Decision Intelligence for Modern Manufacturing
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-white/60">Machines</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-white/60">Workers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/60">Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Factory className="w-12 h-12 text-[#1F3A5F] mr-3" />
            <span className="text-2xl font-bold text-[#1F3A5F]">FactoryMind AI</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h2>
              <p className="text-[#6B7280]">Sign in to your factory dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="factory@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E7EB] text-[#1F3A5F] focus:ring-[#1F3A5F]"
                  />
                  <span className="text text-[#6B7280]">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#1F3A5F] hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full bg-[#1F3A5F] hover:bg-[#2A4A73]">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#6B7280] text-sm">
                Don't have an account?{' '}
                <a href="#" className="text-[#1F3A5F] font-medium hover:underline">
                  Contact your administrator
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-[#6B7280]">
            <p>Industry 4.0 & 5.0 Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
