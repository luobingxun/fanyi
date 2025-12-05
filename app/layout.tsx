import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';
import { AuthProvider } from '@/components/AuthProvider';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Fanyi 翻译管理系统',
  description: '前端多语言管理系统'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`antialiased`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
