import NVSNavbar from "../components/NVSNavbar";

export default function NationalVolunteerServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sora">
      <NVSNavbar />

      <main className="min-h-0 flex-1">{children}</main>

      <footer className="shrink-0 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-tranquil-black sm:px-6 lg:px-8">
          © {new Date().getFullYear()} National Volunteer Services
        </div>
      </footer>
    </div>
  );
}
