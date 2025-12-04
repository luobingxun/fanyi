'use client';

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useSidebar, SidebarProvider } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const { isCollapsed } = useSidebar();

  if (isAuthPage) {
    return (
        <main className="min-h-screen bg-background">
            {children}
        </main>
    );
  }

  const marginClass = isCollapsed ? "ml-24" : "ml-[15rem]";

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        marginClass
      )}>
        <AppHeader />
        <main className="flex-1 p-8">
          {children}
        </main>
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
