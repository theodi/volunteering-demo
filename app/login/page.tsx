"use client";

import { useRouter } from "next/navigation";
import { SolidLoginPage } from "solid-react-component/login/next";

export default function LoginPage() {
  const router = useRouter();

  // Redirect the IdP straight to "/" so the user doesn't bounce through /login
  const redirectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/`
      : undefined;

  return (
    <SolidLoginPage
      redirectUrl={redirectUrl}
      onAlreadyLoggedIn={() => router.replace("/")}
      title="Sign in"
      subtitle="to continue to Vounteering Demo"
    />
  );
}
