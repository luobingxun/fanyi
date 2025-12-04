'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        alert('登录失败：用户名或密码错误');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert('登录出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Testimonial Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-blue-700/50 to-blue-800/60" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/30">
              译
            </div>
            <span className="text-xl font-bold tracking-wide">Fanyi</span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-semibold leading-tight mb-8 text-white">
            &ldquo;Fanyi 完全改变了我们要管理全球内容本地化的方式。它简直是不可或缺的。&rdquo;
          </blockquote>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow-xl">
              张
            </div>
            <div>
              <div className="font-semibold text-white">张明, 技术总监</div>
              <div className="text-sm text-blue-100">某科技公司</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-100">
          © 2024 FANYI SYSTEMS
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                译
              </div>
              <span className="text-2xl font-semibold text-gray-900">Fanyi</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">欢迎回来</h1>
            <p className="text-gray-600 text-sm">请输入您的凭据以访问工作区。</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                用户名
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="h-9 pl-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  密码
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
                >
                  忘记密码?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-9 pl-10 pr-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-9 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl shadow-primary/30 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">或者使用</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">还没有账号？</span>
            {' '}
            <Link 
              href="/register" 
              className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
