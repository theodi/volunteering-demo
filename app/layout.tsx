import type { Metadata } from "next";
import { SolidProviders } from "./providers";
import { AuthWithReturnUrl } from "./components/AuthWithReturnUrl";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vounteering Demo",
  description: "Solid-powered volunteering demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SolidProviders>
          <AuthWithReturnUrl>{children}</AuthWithReturnUrl>
        </SolidProviders>
      </body>
    </html>
  );
}
