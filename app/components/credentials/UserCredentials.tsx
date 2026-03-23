"use client";

import { useState } from "react";
import { PlusIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { CredentialCard } from "./CredentialCard";
import type { CredentialStatus } from "./CredentialCard";
import { AddCredentialModal } from "./AddCredentialModal";
import type { CredentialType } from "./AddCredentialModal";
import { HeroText } from "../HeroText";
import { Button } from "../Button";
import { EmptyState } from "../profile/EmptyState";

type CredentialItem = {
    id: string;
    title: string;
    issuer: string;
    status: CredentialStatus;
};

export function UserCredentials() {
    const [credentials, setCredentials] = useState<CredentialItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const handleAddCredential = (cred: CredentialType) => {
        const newItem: CredentialItem = {
            id: `${cred.id}-${Date.now()}`,
            title: cred.title,
            issuer: cred.issuer,
            status: "collect",
        };
        setCredentials((prev) => [...prev, newItem]);
    };

    const existingIds = new Set(credentials.map((c) => c.id.replace(/-\d+$/, "")));

    return (
        <>
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
                        onClick={() => setModalOpen(true)}
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

                    {/* Credential list or empty state */}
                    {credentials.length === 0 ? (
                        <EmptyState
                            title="No credentials yet"
                            description="Add a credential to get started."
                            icon={<LockClosedIcon className="h-5 w-5" />}
                            className="border-none bg-transparent"
                        />
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {credentials.map((cred) => (
                                <CredentialCard
                                    key={cred.id}
                                    title={cred.title}
                                    issuer={cred.issuer}
                                    status={cred.status}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <AddCredentialModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleAddCredential}
                existingCredentialIds={existingIds}
            />
        </>
    );
}
