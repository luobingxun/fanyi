'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  Settings,
  FolderPlus,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { useSidebar } from '@/hooks/useSidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const isProjectRoute = pathname.startsWith('/projects/');
  const projectId = isProjectRoute ? pathname.split('/')[2] : null;
  const { isCollapsed, toggle } = useSidebar();

  return (
    <div
      className={cn(
        'h-[calc(100vh-2rem)] m-4 bg-[#1a1a1a] border border-white/10 flex flex-col fixed left-0 top-0 transition-all duration-300 shadow-xl z-50 rounded-2xl',
        isCollapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Header with toggle button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && (
          <h1 className="text-lg font-bold text-white truncate">Fanyi</h1>
        )}
        <button
          onClick={toggle}
          className={cn(
            'p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? '展开侧边栏' : '收缩侧边栏'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* General Section */}
        <div className="mb-4">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              常规管理
            </h2>
          )}
          <Link
            href="/"
            className={cn(
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              isCollapsed ? 'justify-center' : 'space-x-3',
              pathname === '/' ||
                (pathname.startsWith('/projects') && !projectId)
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            )}
            title={isCollapsed ? '项目列表' : ''}
          >
            <FolderPlus
              className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
            />
            {!isCollapsed && <span>项目列表</span>}
          </Link>
          <Link
            href="/settings"
            className={cn(
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              isCollapsed ? 'justify-center' : 'space-x-3',
              pathname === '/settings'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            )}
            title={isCollapsed ? '全局设置' : ''}
          >
            <Settings
              className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
            />
            {!isCollapsed && <span>全局设置</span>}
          </Link>
        </div>

        {/* Project Section */}
        {projectId && (
          <div className="mb-4">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                当前项目
              </h2>
            )}
            <Link
              href={`/projects/${projectId}`}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isCollapsed ? 'justify-center' : 'space-x-3',
                pathname === `/projects/${projectId}`
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? '项目概览' : ''}
            >
              <LayoutDashboard
                className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
              />
              {!isCollapsed && <span>项目概览</span>}
            </Link>
            <Link
              href={`/projects/${projectId}/translations`}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isCollapsed ? 'justify-center' : 'space-x-3',
                pathname.includes(`/projects/${projectId}/translations`)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? '文本翻译' : ''}
            >
              <Globe
                className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
              />
              {!isCollapsed && <span>文本翻译</span>}
            </Link>
            <Link
              href={`/projects/${projectId}/corpus`}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isCollapsed ? 'justify-center' : 'space-x-3',
                pathname.includes(`/projects/${projectId}/corpus`)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? '语料管理' : ''}
            >
              <BookOpen
                className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
              />
              {!isCollapsed && <span>语料管理</span>}
            </Link>
            <Link
              href={`/projects/${projectId}/settings`}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isCollapsed ? 'justify-center' : 'space-x-3',
                pathname.includes(`/projects/${projectId}/settings`)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? '项目设置' : ''}
            >
              <Settings
                className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')}
              />
              {!isCollapsed && <span>项目设置</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          className={cn(
            'w-full text-gray-400 hover:text-white hover:bg-white/10 transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          onClick={() => signOut()}
          title={isCollapsed ? '退出登录' : ''}
        >
          <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
          {!isCollapsed && <span>退出登录</span>}
        </Button>
      </div>
    </div>
  );
}
