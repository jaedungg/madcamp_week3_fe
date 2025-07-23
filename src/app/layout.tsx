'use client';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { UserProvider } from '@/context/UserContext';
import { ProfileImageProvider } from '@/context/ProfileImageContext';
import { NicknameProvider } from '@/context/NicknameContext';
import { SessionProvider, useSession } from 'next-auth/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// 로그인 상태에 따라 Header, Sidebar 렌더링을 분리하기 위한 컴포넌트 생성
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('chart');

  // loading 상태나 인증 안된 상태일 땐 Header / Sidebar 숨기기
  if (status === 'loading' || !session?.user) {
    return (
      <div className="w-full h-full">
        {/* 로그인 안 된 상태면 헤더/사이드바 없이 children만 노출 */}
        {children}
      </div>
    );
  }

  // 로그인 된 상태
  return (
    <>
      <Header />
      <div className="flex h-screen pt-16 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="ml-[240px] px-5 py-5 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <UserProvider>
            <ProfileImageProvider>
              <NicknameProvider>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#6366f1',
                    },
                  }}
                >
                  <LayoutContent>{children}</LayoutContent>
                </ConfigProvider>
              </NicknameProvider>
            </ProfileImageProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
