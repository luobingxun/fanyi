'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { useSidebar, SidebarProvider } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';
  const { isCollapsed } = useSidebar();

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  const marginClass = isCollapsed ? 'ml-20' : 'ml-56';

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-300',
            marginClass
          )}
        >
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
