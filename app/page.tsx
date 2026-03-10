"use client";

import { Suspense } from "react";
import {
  SolidLoginNavigationProviderNext,
  AuthGuard,
} from "solid-react-component/login/next";
import { ProfilePage } from "./components/profile/ProfilePage";

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <SolidLoginNavigationProviderNext
        config={{ loginPath: "/login", homePath: "/" }}
      >
        <AuthGuard>
          <ProfilePage />
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
