import type { Metadata } from "next";
import { SolidProviders } from "./providers";
import { Nav } from "./components/Nav";
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
          <Nav />
          {children}
        </SolidProviders>
      </body>
    </html>
  );
}
