'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      alert('新密码和确认密码不匹配');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('新密码长度至少为6位');
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, oldPassword, newPassword }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || '请求失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求出错');
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

        {/* Message */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-semibold leading-tight mb-6">
            重置密码
          </h2>
          <p className="text-base text-white leading-relaxed">
            输入您的用户名和旧密码，然后设置新密码。
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-100">
          © 2024 FANYI SYSTEMS
        </div>
      </div>

      {/* Right Side - Form */}
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

          {!submitted ? (
            <>
              {/* Form Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">忘记密码？</h1>
                <p className="text-gray-600 text-sm">输入您的用户名和密码信息以重置密码。</p>
              </div>

              {/* Form */}
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
                      className="h-9 pl-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="请输入用户名"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="oldPassword" className="text-sm font-semibold text-gray-700">
                    旧密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                    <Input 
                      id="oldPassword" 
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      required 
                      className="h-9 pl-10 pr-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="请输入旧密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    新密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                    <Input 
                      id="newPassword" 
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      className="h-9 pl-10 pr-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="请输入新密码（至少6位）"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    确认新密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="h-9 pl-10 pr-10 bg-white border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="请再次输入新密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                      提交中...
                    </>
                  ) : (
                    '重置密码'
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回登录
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">密码重置成功</h2>
                <p className="text-gray-600 mb-6">
                  您的密码已成功重置，现在可以使用新密码登录了。
                </p>
                <Link 
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回登录
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
