"use client";

import { CakeIcon, PhoneIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import type { UserProfile } from "@/app/lib/hooks/useUserProfile";

function Field({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
}) {
  const isEmpty = value == null || value.trim() === "";
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      {isEmpty ? (
        <EmptyState compact title="Not set" />
      ) : (
        <span>{value}</span>
      )}
    </li>
  );
}

export function ProfileHeader({ profile }: { profile?: UserProfile | null }) {
  const name = profile?.name?.trim();
  const title = profile?.title?.trim() || profile?.role?.trim();
  const photoUrl = profile?.photoUrl?.trim() || null;
  const displayName = name && name.length > 0 ? name : null;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-24 sm:w-24">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-500 sm:text-3xl">
              {initial}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-xl font-semibold sm:text-2xl">
            {displayName ?? <EmptyState compact title="Not set" />}
          </h1>
          <p className="mt-0.5 text-sm text-tranquil-black">
            {title ?? <EmptyState compact title="Not set" />}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-tranquil-black">
            <Field icon={CakeIcon} value={profile?.bday ?? null} />
            <Field icon={PhoneIcon} value={profile?.phone ?? null} />
            <Field icon={MapPinIcon} value={profile?.location ?? null} />
            <Field icon={EnvelopeIcon} value={profile?.email ?? null} />
          </ul>
        </div>
      </div>
    </Card>
  );
}
