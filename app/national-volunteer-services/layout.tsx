export default function NationalVolunteerServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-tranquil-black">
            National Volunteer Services
          </h1>
        </div>
      </header>

      <main className="min-h-0 flex-1">{children}</main>

      <footer className="shrink-0 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-tranquil-black sm:px-6 lg:px-8">
          © {new Date().getFullYear()} National Volunteer Services
        </div>
      </footer>
    </div>
  );
}
