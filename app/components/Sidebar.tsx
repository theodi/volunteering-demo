"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseIcon,
  UserIcon,
  CalendarIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "@/app/contexts/SidebarContext";

const navItems = [
  { href: "/", label: "Work & Study", icon: BriefcaseIcon },
  { href: "/volunteer-info", label: "Volunteer Info", icon: UserIcon },
  { href: "/availability", label: "Availability", icon: CalendarIcon },
  { href: "/credentials", label: "Credentials", icon: LockClosedIcon },
] as const;

function SidebarNavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-1 p-3 pt-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-light text-primary"
                : "text-tranquil-black hover:bg-gray-100"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-gray-200 pt-3">
        <Link
          href="/login"
          onClick={onLinkClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-tranquil-black transition-colors hover:bg-gray-100"
        >
          <ArrowRightOnRectangleIcon
            className="h-5 w-5 shrink-0"
            aria-hidden
          />
          Logout
        </Link>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Mobile drawer - fixed, starts below nav */}
      <aside
        aria-label="Sidebar navigation"
        className={`fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-gray-200 bg-white font-sans transition-transform duration-200 ease-out sm:top-16 sm:h-[calc(100vh-4rem)] md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNavContent onLinkClick={close} />
      </aside>

      {/* Desktop sidebar - in document flow, never overlaps nav */}
      <aside
        aria-label="Sidebar navigation"
        className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white font-sans md:flex md:h-[calc(100vh-4rem)]"
      >
        <SidebarNavContent />
      </aside>
    </>
  );
}
