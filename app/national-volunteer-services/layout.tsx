import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";

export default function NationalVolunteerServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sora">
      <NVSNavbar />

      <main className="min-h-0 flex-1">{children}</main>

      <NVSFooter />
    </div>
  );
}
