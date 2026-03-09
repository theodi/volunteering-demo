"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bars3Icon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { SolidLogo } from "./SolidLogo";
import { useSidebar } from "@/app/contexts/SidebarContext";

export function Nav() {
  const { toggle } = useSidebar();

  return (
    <header
      className="sticky top-0 z-60 w-full border-b bg-cosmos font-sans"
    >
      <nav
        className="mx-auto flex h-14 max-w-[100vw] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-label="Open sidebar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos"
          aria-label="Home"
        >
          <SolidLogo className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
        </Link>

        {/* Right: user + help */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* User profile + chevron */}
          <button
            type="button"
            className="flex items-center gap-1 rounded-full p-1 text-white transition-colors bg-bold-grey focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos sm:gap-2 sm:pr-2"
            aria-expanded={false}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white sm:h-9 sm:w-9">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            <ChevronDownIcon className="h-5 w-5 shrink-0" aria-hidden />
          </button>

          {/* Separator */}
          <span
            className="h-6 w-px shrink-0 bg-bold-grey sm:h-8"
            aria-hidden
          />

          {/* Help */}
          <a
            href="/help"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos sm:h-10 sm:w-10"
            aria-label="Help"
          >
            <QuestionMarkCircleIcon className="h-8 w-8" aria-hidden />
          </a>
        </div>
      </nav>
    </header>
  );
}
