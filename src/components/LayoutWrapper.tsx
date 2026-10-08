"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import PublicNavbar from "@/components/PublicNavbar";

export default function LayoutWrapper({ children, isAuthenticated = false }: { children: React.ReactNode, isAuthenticated?: boolean }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isLandingPage = pathname === "/";
  
  // Rules for Sidebar (Dashboard layout):
  // 1. Must be authenticated.
  // 2. Cannot be an auth page or landing page.
  const showSidebar = isAuthenticated && !isAuthPage && !isLandingPage;
  
  // Rules for Public Navbar:
  // 1. Shown if NOT using the dashboard layout, AND NOT an auth page.
  const showPublicNavbar = !showSidebar && !isAuthPage;

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'md:ml-[72px]' : ''} transition-all duration-300 min-h-screen flex flex-col relative`}>
        {showSidebar && <TopHeader />}
        {showPublicNavbar && <PublicNavbar isAuthenticated={isAuthenticated} />}
        
        <div className={`flex-1 ${showSidebar ? 'p-6 md:p-10' : (showPublicNavbar ? 'pt-20' : '')}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
