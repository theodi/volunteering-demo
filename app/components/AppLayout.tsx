"use client";

import { Nav } from "./Nav";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/app/contexts/SidebarContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Nav />
      <div className="flex min-h-screen flex-1">
        <Sidebar />
        <main className="min-h-screen flex-1 md:pt-0 bg-white">{children}</main>
      </div>
    </SidebarProvider>
  );
}
