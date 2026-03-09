"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  SolidLoginNavigationProviderNext,
  AuthGuard,
} from "solid-react-component/login/next";

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <SolidLoginNavigationProviderNext
        config={{ loginPath: "/login", homePath: "/" }}
      >
        <AuthGuard>
          <HomeContent />
        </AuthGuard>
      </SolidLoginNavigationProviderNext>
    </Suspense>
  );
}

function HomeFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
    </div>
  );
}

function HomeContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans">
      <main className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight ">
          Work & Study
        </h1>
        <p className="">
          You are signed in. Welcome!
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-tranquil-black transition-colors hover:bg-gray-50"
        >
          Sign in again
        </Link>
      </main>
    </div>
  );
}
