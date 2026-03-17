import Image from "next/image";
import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { ShareIcon } from "@heroicons/react/24/outline";
import type { ProfileSocialLinks, SocialPlatformKey } from "@/app/lib/hooks/useUserProfile";

export type { ProfileSocialLinks, SocialPlatformKey };

const SOCIAL_PLATFORMS: Array<{
  key: SocialPlatformKey;
  name: string;
  src: string;
  label: string;
}> = [
    { key: "facebook", name: "Facebook", src: "/facebook.svg", label: "Facebook" },
    {
      key: "instagram",
      name: "Instagram",
      src: "/instagram.svg",
      label: "Instagram",
    },
    { key: "x", name: "X", src: "/x.png", label: "X" },
    { key: "snapchat", name: "Snapchat", src: "/snapchat.svg", label: "Snapchat" },
  ];

function getProfileUrl(
  profileLinks: ProfileSocialLinks,
  key: SocialPlatformKey
): string | undefined {
  const url = profileLinks[key];
  if (url != null && url.trim() !== "") return url.trim();
  if (key === "x" && profileLinks.twitter != null && profileLinks.twitter.trim() !== "")
    return profileLinks.twitter.trim();
  return undefined;
}

export function FollowMeOn({
  profileLinks = {},
  className,
}: {
  /** Social profile URLs from the user's pod (e.g. WebID). Keys: facebook, instagram, twitter/x, snapchat. */
  profileLinks?: ProfileSocialLinks;
  className?: string;
}) {
  const entries = SOCIAL_PLATFORMS.map((platform) => ({
    ...platform,
    href: getProfileUrl(profileLinks, platform.key),
  })).filter((e): e is typeof e & { href: string } => e.href != null);

  const hasAnyLinks = entries.length > 0;

  return (
    <Card className={className}>
      <SectionTitle>Follow me on</SectionTitle>
      <div className="flex flex-wrap gap-3">
        {hasAnyLinks ? (
          entries.map(({ key, name, href, src, label }) => (
            <Link
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 shrink-0 items-center justify-center"
            >
              <Image
                src={src}
                alt=""
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </Link>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <EmptyState
              title="No links yet"
              description="Add your social or profile links."
              icon={<ShareIcon className="h-5 w-5" />}
              className="border-none bg-transparent"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
