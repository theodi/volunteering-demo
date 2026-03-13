"use client";

import { Bio } from "./Bio";
import { EducationSection } from "./EducationSection";
import { FollowMeOn } from "./FollowMeOn";
import { Languages } from "./Languages";
import { ProfileHeader } from "./ProfileHeader";
import { ResumeSection } from "./ResumeSection";
import { ScanProfile } from "./ScanProfile";
import { Skills } from "./Skills";
import { useUserProfile } from "@/app/lib/hooks/useUserProfile";

export function ProfilePage() {
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-tranquil-black">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 py-8 md:px-6">
      {error && (
        <div className="w-full rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Could not load full profile from WebID. Showing available data.
        </div>
      )}
      <section className="flex w-full flex-col items-start gap-5 md:flex-row md:items-stretch">
        <div className="w-full md:max-w-[764px]">
          <ProfileHeader profile={profile} />
        </div>
        <div className="w-full md:max-w-[320px]">
          <FollowMeOn
            profileLinks={profile?.socialLinks}
            className="h-full min-h-0"
          />
        </div>
      </section>

      <section className="flex w-full flex-col items-start gap-5 md:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <Bio bio={profile?.note ?? null} />
          <ResumeSection />
          <EducationSection />
        </div>
        <aside className="w-full space-y-5 md:w-80 md:shrink-0">
          <Skills />
          <Languages />
          <ScanProfile webId={profile?.webId} />
        </aside>
      </section>
    </main>
  );
}
