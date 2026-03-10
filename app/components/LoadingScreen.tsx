"use client";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        </div>
        <p className="text-sm font-medium text-tranquil-black/60 dark:text-zinc-400">
          Loading…
        </p>
      </div>
    </div>
  );
}
