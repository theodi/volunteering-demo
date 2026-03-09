"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  SolidLoginNavigationProviderNext,
  AuthGuard,
  SolidLoginPage,
} from "solid-react-component/login/next";

export default function LoginPage() {
  const router = useRouter();
  return (
    <Suspense fallback={<LoginFallback />}>
      <SolidLoginNavigationProviderNext
        config={{ loginPath: "/login", homePath: "/" }}
      >
        <AuthGuard>
          <SolidLoginPage
            onAlreadyLoggedIn={() => router.replace("/")}
            title="Sign in"
            subtitle="to continue to Vounteering Demo"
          />
        </AuthGuard>
      </SolidLoginNavigationProviderNext>
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
    </div>
  );
}
