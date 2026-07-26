'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory, Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [role, setRole] = useState<'OWNER' | 'MANAGER'>('OWNER');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await register(email, password, name, role, factoryId || 'factory-cyril-001');
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Factory Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
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
            Join the Industrial AI Revolution
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Factory className="w-12 h-12 text-primary mr-3" />
            <span className="text-2xl font-bold text-primary">FactoryMind AI</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Create an Account</h2>
              <p className="text-muted">Register your factory to get started</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type / Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'OWNER'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border text-muted hover:bg-background'
                    }`}
                  >
                    👑 Factory Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('MANAGER')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'MANAGER'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border text-muted hover:bg-background'
                    }`}
                  >
                    👷 Manager
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Mr. Kumar"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="factory@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="factoryId">Factory / Company Name</Label>
                <div className="relative">
                  <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <Input
                    id="factoryId"
                    type="text"
                    placeholder="Precision Forgings"
                    className="pl-10"
                    value={factoryId}
                    onChange={(e) => setFactoryId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Register Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted">
            <p>Industry 4.0 & 5.0 Ready · Secured by Firebase Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
