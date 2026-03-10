import { Bio } from "./Bio";
import { EducationSection } from "./EducationSection";
import { FollowMeOn } from "./FollowMeOn";
import { Languages } from "./Languages";
import { ProfileHeader } from "./ProfileHeader";
import { ResumeSection } from "./ResumeSection";
import { ScanProfile } from "./ScanProfile";
import { Skills } from "./Skills";

export function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 py-8 md:px-6">
      <section className="flex w-full flex-col items-start gap-5 md:flex-row md:items-stretch">
        <div className="w-full md:max-w-[764px]">
          <ProfileHeader />
        </div>
        <div className="w-full md:max-w-[320px]">
          <FollowMeOn className="h-full min-h-0" />
        </div>
      </section>

      <section className="flex w-full flex-col items-start gap-5 md:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <Bio />
          <ResumeSection />
          <EducationSection />
        </div>
        <aside className="w-full space-y-5 md:w-80 md:shrink-0">
          <Skills />
          <Languages />
          <ScanProfile />
        </aside>
      </section>
    </main>
  );
}
