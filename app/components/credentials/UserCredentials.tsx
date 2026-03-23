"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { CredentialCard } from "./CredentialCard";
import type { CredentialStatus } from "./CredentialCard";
import { HeroText } from "../HeroText";
import { Button } from "../Button";

type CredentialItem = {
    id: string;
    title: string;
    issuer: string;
    status: CredentialStatus;
};

const MOCK_CREDENTIALS: CredentialItem[] = [
    {
        id: "dbs-1",
        title: "UK DBS Check",
        issuer: "Disclosure and Barring Service GOV.UK",
        status: "verified",
    },
    {
        id: "first-aid-1",
        title: "First Aid Certificate",
        issuer: "Disclosure and Barring Service GOV.UK",
        status: "collect",
    },
    {
        id: "dbs-2",
        title: "UK DBS Check",
        issuer: "Disclosure and Barring Service GOV.UK",
        status: "collect",
    },
];

export function UserCredentials() {
    return (
        <section className="mx-auto w-full flex flex-col gap-4 sm:gap-6 rounded-md border border-gray-200 bg-white p-5 sm:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <HeroText
                    title="Credentials"
                    description="DBS status drives the &quot;Share DBS&quot; button in Vera"
                    titleClassName="text-xl! sm:text-2xl! font-medium! tracking-tight text-black!"
                    descriptionClassName="mt-2.5! text-sm! sm:text-base! leading-relaxed text-slate-700!"
                />
                <Button
                    variant="primary"
                    size="md"
                    className="shrink-0 gap-1.5! rounded-md! border-none! bg-primary! shadow-sm! px-3! py-2! text-sm! font-medium!"
                >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                    Add Credential
                </Button>
            </div>

            <div className="w-full space-y-4">
                {/* Section label */}
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                    Verified Credentials
                </h2>

                {/* Credential list */}
                <div className="flex flex-col gap-2.5">
                    {MOCK_CREDENTIALS.map((cred) => (
                        <CredentialCard
                            key={cred.id}
                            title={cred.title}
                            issuer={cred.issuer}
                            status={cred.status}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
