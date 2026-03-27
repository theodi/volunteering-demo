import type { Metadata } from "next";
import { SolidProviders } from "./providers";
import { AuthWithReturnUrl } from "./components/AuthWithReturnUrl";
import { loadVolunteerOntology } from "@/app/lib/loadVolunteerOntology.server";
import { VolunteerOntologyProvider } from "@/app/contexts/VolunteerOntologyContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solid Profile Manager",
  description: "Solid-powered Profile Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { causes, equipment, skills } = loadVolunteerOntology();
  return (
    <html lang="en">
      <body className="antialiased">
        <SolidProviders>
          <AuthWithReturnUrl>
            <VolunteerOntologyProvider causes={causes} equipment={equipment} skills={skills}>
              {children}
            </VolunteerOntologyProvider>
          </AuthWithReturnUrl>
        </SolidProviders>
      </body>
    </html>
  );
}
