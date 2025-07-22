'use client';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// import 'antd/dist/reset.css';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { UserProvider } from '@/context/UserContext';
import { ProfileImageProvider } from '@/context/ProfileImageContext';
import { NicknameProvider } from '@/context/NicknameContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeTab, setActiveTab] = useState('chart');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <ProfileImageProvider>
            <NicknameProvider>
              <ConfigProvider
                theme={{
                  token: {
                    // Seed Token
                    colorPrimary: '#6366f1',
                  },
                }}
              >
                <Header />
                <div className="flex h-screen pt-16 overflow-hidden">
                  <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                  <div className="ml-[240px] px-5 py-5 w-full h-full overflow-y-auto">
                    {children}
                  </div>
                </div>
              </ConfigProvider>
            </NicknameProvider>
          </ProfileImageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
