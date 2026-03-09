"use client";

import { BrowserSolidLdoProvider } from "@ldo/solid-react";

export function SolidProviders({ children }: { children: React.ReactNode }) {
  return <BrowserSolidLdoProvider>{children}</BrowserSolidLdoProvider>;
}
