"use client";

import { useEffect, useState } from "react";
import { useSolidAuth } from "@ldo/solid-react";
import { fetchAndParseProfile } from "@/app/lib/helpers/profileUtils";

export interface UserProfile {
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  phone: string | null;
  organization: string | null;
  role: string | null;
  title: string | null;
  website: string | null;
  webId: string | null;
  bday: string | null;
  note: string | null;
  location: string | null;
  preferredSubjectPronoun: string | null;
  /** Social profile URLs by platform (facebook, instagram, twitter/x, snapchat). From schema:sameAs etc. */
  socialLinks: ProfileSocialLinks;
}

/** Platform keys for social links. */
export type SocialPlatformKey =
  | "facebook"
  | "instagram"
  | "twitter"
  | "x"
  | "snapchat";

export type ProfileSocialLinks = Partial<Record<SocialPlatformKey, string>>;

const emptyProfile: UserProfile = {
  name: null,
  email: null,
  photoUrl: null,
  phone: null,
  organization: null,
  role: null,
  title: null,
  website: null,
  webId: null,
  bday: null,
  note: null,
  location: null,
  preferredSubjectPronoun: null,
  socialLinks: {},
};

/** Map schema:sameAs (and similar) URLs to profile social links by hostname. */
function urlsToSocialLinks(urls: Set<string>): ProfileSocialLinks {
  const out: ProfileSocialLinks = {};
  for (const url of urls) {
    const u = url.trim();
    if (!u) continue;
    try {
      const host = new URL(u).hostname.toLowerCase();
      if (host.includes("facebook.com") || host.includes("fb.com"))
        out.facebook = u;
      else if (host.includes("instagram.com")) out.instagram = u;
      else if (host.includes("twitter.com") || host.includes("x.com"))
        out.twitter = out.twitter ?? u;
      else if (host.includes("snapchat.com")) out.snapchat = u;
    } catch {
      // ignore invalid URLs
    }
  }
  return out;
}
function normalizeContactValue(value: string | null): string | null {
  if (value == null || value === "") return null;
  const v = value.trim();
  if (v.startsWith("mailto:")) return v.slice(7).trim() || null;
  if (v.startsWith("tel:")) return v.slice(4).trim() || null;
  return v;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetches WebID profile using rdfjs-wrapper (solid-file-manager pattern).
 * When not logged in or fetch fails, returns profile with null fields for empty states.
 */
export function useUserProfile(): UseUserProfileResult {
  const { session } = useSolidAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        if (!session.isLoggedIn || !session.webId) {
          setProfile(emptyProfile);
          return;
        }

        const webId = session.webId;
        const fetchFn =
          typeof (session as { fetch?: typeof fetch }).fetch === "function"
            ? (session as { fetch: typeof fetch }).fetch
            : fetch;

        const agent = await fetchAndParseProfile(webId, fetchFn);

        if (!agent) {
          setProfile({
            ...emptyProfile,
            webId,
            name: webId.split("/").pop()?.split("#")[0] ?? webId,
          });
          return;
        }

        setProfile({
          name: agent.name ?? null,
          email: normalizeContactValue(agent.email) ?? agent.email ?? null,
          photoUrl: agent.photoUrl ?? null,
          phone: normalizeContactValue(agent.phone) ?? agent.phone ?? null,
          organization: agent.organization ?? null,
          role: agent.role ?? null,
          title: agent.title ?? null,
          website: agent.website ?? null,
          webId,
          bday: agent.bday ?? null,
          note: agent.note ?? null,
          location: agent.location ?? null,
          preferredSubjectPronoun: agent.preferredSubjectPronoun ?? null,
          socialLinks: urlsToSocialLinks(agent.sameAs),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load profile")
        );
        setProfile(
          session.webId
            ? { ...emptyProfile, webId: session.webId }
            : emptyProfile
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [session.isLoggedIn, session.webId]);

  return { profile, isLoading, error };
}
