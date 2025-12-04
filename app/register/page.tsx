'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        alert('注册成功，请登录');
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || '注册失败');
      }
    } catch (error) {
      console.error(error);
      alert('注册出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding Section */}
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

        {/* Welcome Message */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-semibold leading-tight mb-6">
            加入 Fanyi
          </h2>
          <p className="text-base text-white leading-relaxed">
            创建您的账号，开始使用专业的翻译管理系统。简化您的全球化工作流程，提升团队协作效率。
          </p>
          
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/80">多语言项目管理</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/80">团队协作工具</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/80">实时翻译同步</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-100">
          © 2024 FANYI SYSTEMS
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">创建账号</h1>
            <p className="text-gray-600 text-sm">填写信息以创建新的管理员账号。</p>
          </div>

          {/* Register Form */}
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
                  placeholder="请输入用户名"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                密码
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-9 pl-10 pr-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="请输入密码"
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
                  注册中...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  注册
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">或者</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">已有账号？</span>
            {' '}
            <Link 
              href="/login" 
              className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
