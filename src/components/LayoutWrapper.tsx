"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const showSidebar = !isLandingPage && !isAuthPage;

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'md:ml-[72px]' : ''} transition-all duration-300 min-h-screen flex flex-col relative`}>
        {showSidebar && <TopHeader />}
        <div className={`flex-1 ${showSidebar ? 'p-6 md:p-10' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
