"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  SolidLoginNavigationProviderNext,
  AuthGuard,
} from "solid-react-component/login/next";
import { AppLayout } from "./AppLayout";
import { LoadingScreen } from "./LoadingScreen";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SolidLoginNavigationProviderNext
      config={{ loginPath: "/login", homePath: "/" }}
    >
      <AuthGuard fallback={<LoadingScreen />}>
        {pathname?.startsWith("/credentials/verify") ? (
          children
        ) : (
          <AppLayout>{children}</AppLayout>
        )}
      </AuthGuard>
    </SolidLoginNavigationProviderNext>
  );
}

export function AuthWithReturnUrl({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}
