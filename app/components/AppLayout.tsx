"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/app/contexts/SidebarContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Nav />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-h-0 flex-1 overflow-y-auto bg-white md:pt-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
