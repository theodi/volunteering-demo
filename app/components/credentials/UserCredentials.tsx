"use client";

import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "user-credentials";

function loadCredentials(): CredentialItem[] {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try { return JSON.parse(stored); } catch { return []; }
}

function saveCredentials(items: CredentialItem[]) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function UserCredentials() {
    const [credentials, setCredentials] = useState<CredentialItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    // Load credentials from sessionStorage on mount
    useEffect(() => {
        const saved = loadCredentials();

        // Check if any credentials were just verified (returning from verify page)
        const updated = saved.map((cred) => {
            const verifiedFlag = sessionStorage.getItem(`credential-verified-${cred.id}`);
            if (verifiedFlag === "true" && cred.status !== "verified") {
                sessionStorage.removeItem(`credential-verified-${cred.id}`);
                return { ...cred, status: "verified" as CredentialStatus };
            }
            return cred;
        });

        setCredentials(updated);
        saveCredentials(updated);
    }, []);

    const updateCredentials = useCallback((updater: (prev: CredentialItem[]) => CredentialItem[]) => {
        setCredentials((prev) => {
            const next = updater(prev);
            saveCredentials(next);
            return next;
        });
    }, []);

    const handleAddCredential = (cred: CredentialType) => {
        const newItem: CredentialItem = {
            id: `${cred.id}-${Date.now()}`,
            title: cred.title,
            issuer: cred.issuer,
            status: "collect",
        };
        updateCredentials((prev) => [...prev, newItem]);
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
                                    credentialId={cred.id}
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
