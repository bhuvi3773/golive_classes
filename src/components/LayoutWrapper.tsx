"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email";
  const showSidebar = !isLandingPage && !isAuthPage;

  const isPlayPage = pathname.startsWith("/courses/") && pathname.endsWith("/play");

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 min-w-0 w-full ${showSidebar ? 'md:ml-[72px]' : ''} transition-all duration-300 min-h-screen flex flex-col relative overflow-x-hidden`}>
        {showSidebar && !isPlayPage && <TopHeader />}
        <div className={`flex-1 min-w-0 w-full ${
          showSidebar 
            ? isPlayPage 
              ? 'p-0 pb-20 md:pb-0' 
              : 'px-4 py-6 md:p-10 pb-24 md:pb-10' 
            : ''
        }`}>
          {children}
        </div>
      </main>
    </div>
  );
}
