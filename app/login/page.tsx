"use client";

import { useRouter } from "next/navigation";
import { SolidLoginPage } from "solid-react-component/login/next";

export default function LoginPage() {
  const router = useRouter();
  return (
    <SolidLoginPage
      onAlreadyLoggedIn={() => router.replace("/")}
      title="Sign in"
      subtitle="to continue to Vounteering Demo"
    />
  );
}
