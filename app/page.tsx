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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Vounteering Demo
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          You are signed in. Welcome!
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Sign in again
        </Link>
      </main>
    </div>
  );
}
