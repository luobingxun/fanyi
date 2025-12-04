'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: session?.user?.name,
          oldPassword, 
          newPassword 
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Reset form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || '修改失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>

      <Card className="w-full">
        <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>
              请输入您的旧密码和新密码以完成修改
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">密码修改成功</h3>
                <p className="text-gray-600 mb-4">
                  您的密码已成功修改，即将返回首页...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Old Password */}
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">旧密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="oldPassword" 
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      required 
                      className="pl-10 pr-10"
                      placeholder="请输入旧密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="newPassword" 
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      className="pl-10 pr-10"
                      placeholder="请输入新密码（至少6位）"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="pl-10 pr-10"
                      placeholder="请再次输入新密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      修改中...
                    </>
                  ) : (
                    '确认修改'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
