'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import 'antd/dist/reset.css';
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeTab, setActiveTab] = useState("chart");
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <div className="pt-16 h-[calc(100vh-64px)]">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-[240px] px-5 py-5 h-[calc(100vh-64px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
