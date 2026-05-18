"use client";

import { useMemo } from "react";
import { useAgent } from "@/app/lib/hooks/useAgent";
import type { Agent } from "@/app/lib/class/Agent";

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
  socialLinks: ProfileSocialLinks;
}

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

/**
 * Safely access an agent property that may throw at runtime.
 * Some Solid Pods store data in unexpected formats (e.g. a plain text literal
 * where the library expects a URL/NamedNode). When that happens, @rdfjs/wrapper
 * throws a type error. We catch it here and return null so that one bad field
 * doesn't break the entire profile.
 */
function safeGet<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

function agentToProfile(agent: Agent, webId: string): UserProfile {
  return {
    name: safeGet(() => agent.name) ?? null,
    email: normalizeContactValue(safeGet(() => agent.email)) ?? safeGet(() => agent.email) ?? null,
    photoUrl: safeGet(() => agent.photoUrl) ?? null,
    phone: normalizeContactValue(safeGet(() => agent.phone)) ?? safeGet(() => agent.phone) ?? null,
    organization: safeGet(() => agent.organization) ?? null,
    role: safeGet(() => agent.role) ?? null,
    title: safeGet(() => agent.title) ?? null,
    website: safeGet(() => agent.website) ?? null,
    webId,
    bday: safeGet(() => agent.bday) ?? null,
    note: safeGet(() => agent.note) ?? null,
    location: safeGet(() => agent.location) ?? null,
    preferredSubjectPronoun: safeGet(() => agent.preferredSubjectPronoun) ?? null,
    socialLinks: safeGet(() => urlsToSocialLinks(agent.sameAs)) ?? {},
  };
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Derives the UserProfile from the shared Agent query.
 * No separate fetch — reuses the same parsed profile as usePodRoot.
 */
export function useUserProfile(): UseUserProfileResult {
  const { webId, agent, isLoading, error } = useAgent();

  const profile = useMemo(() => {
    if (!webId) return emptyProfile;
    if (!agent) return { ...emptyProfile, webId };
    return agentToProfile(agent, webId);
  }, [agent, webId]);

  return { profile, isLoading, error };
}
