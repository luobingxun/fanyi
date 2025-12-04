'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, KeyRound } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function AppHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const username = session?.user?.name || 'Guest';
  
  // Generate avatar initials from username
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="搜索项目、翻译..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Section - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-4 border-l focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all hover:bg-gray-50 pr-2 py-1">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                {getInitials(username)}
              </div>
              
              {/* User Name */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">管理员</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || '管理员账户'}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>修改密码</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
