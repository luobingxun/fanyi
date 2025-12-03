'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Globe, BookOpen, Settings, FolderPlus, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const isProjectRoute = pathname.startsWith('/projects/');
  const projectId = isProjectRoute ? pathname.split('/')[2] : null;

  return (
    <div className="w-64 h-screen bg-gray-50 border-r flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b h-16 flex items-center">
        <h1 className="text-xl font-bold text-primary">Fanyi 翻译管理</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            常规管理
          </h2>
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === '/' || (pathname.startsWith('/projects') && !projectId)
                ? "bg-primary/10 text-primary" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <FolderPlus className="w-4 h-4" />
            <span>项目列表</span>
          </Link>
          <Link
             href="/settings"
             className={cn(
               "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
               pathname === '/settings'
                 ? "bg-primary/10 text-primary"
                 : "text-gray-700 hover:bg-gray-100"
             )}
           >
             <Settings className="w-4 h-4" />
             <span>全局设置</span>
           </Link>
        </div>

        {projectId && (
          <div className="mb-6">
             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              当前项目
            </h2>
            <Link
              href={`/projects/${projectId}`}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === `/projects/${projectId}`
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>项目概览</span>
            </Link>
            <Link
              href={`/projects/${projectId}/translations`}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.includes(`/projects/${projectId}/translations`)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Globe className="w-4 h-4" />
              <span>文本翻译</span>
            </Link>
            <Link
              href={`/projects/${projectId}/corpus`}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.includes(`/projects/${projectId}/corpus`)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>语料管理</span>
            </Link>
             <Link
              href={`/projects/${projectId}/settings`}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.includes(`/projects/${projectId}/settings`)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Settings className="w-4 h-4" />
              <span>项目设置</span>
            </Link>
          </div>
        )}
      </nav>
      <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> 退出登录
          </Button>
      </div>
    </div>
  );
}
