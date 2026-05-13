"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { CredentialCard } from "./CredentialCard";
import { AddCredentialModal } from "./AddCredentialModal";
import { RemoveCredentialModal } from "./RemoveCredentialModal";
import type { CredentialType } from "./AddCredentialModal";
import type { SupportedDocumentEntry } from "@/app/api/yoti/supported-documents/route";
import { HeroText } from "../HeroText";
import { Button } from "../Button";
import { EmptyState } from "../profile/EmptyState";
import { useCredentials } from "@/app/lib/hooks/useCredentials";
import type { PodCredential } from "@/app/lib/hooks/useCredentials";
import { LoadingScreen } from "../LoadingScreen";

async function fetchSupportedDocuments(): Promise<SupportedDocumentEntry[]> {
    const res = await fetch("/api/yoti/supported-documents");
    if (!res.ok) throw new Error("Failed to fetch supported documents");
    return res.json();
}

export function UserCredentials() {
    const { credentials, isLoading, addCredential, removeCredential } = useCredentials();
    const [modalOpen, setModalOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<{ id: string; title: string } | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const router = useRouter();

    const { data: yotiDocuments = [], isLoading: yotiLoading } = useQuery({
        queryKey: ["yoti-supported-documents"],
        queryFn: fetchSupportedDocuments,
        staleTime: 5 * 60 * 1000, // cache for 5 minutes
    });

    const handleAddCredential = async (cred: CredentialType) => {
        const now = new Date().toISOString();
        const newCredential: PodCredential = {
            id: `cred-${new Date(now).getTime()}`,
            title: cred.title,
            issuer: cred.issuer,
            requirementUri: cred.requirementUri,
            issuerUri: cred.issuerUri,
            status: "collect",
            validFrom: now,
        };
        await addCredential(newCredential);
    };

    // Credential IDs already in the Pod (for highlighting in the modal)
    const existingIds = new Set(credentials.map((c) => c.id));

    const handleDocumentSelect = (documentType: string, countryCode: string) => {
        router.push(`/credentials/issue/${documentType}?country=${countryCode}`);
    };

    const handleConfirmRemove = async () => {
        if (!removeTarget) return;
        setIsRemoving(true);
        try {
            await removeCredential(removeTarget.id);
        } catch (err) {
            console.error("Failed to remove credential:", err);
        } finally {
            setIsRemoving(false);
            setRemoveTarget(null);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <section className="mx-auto w-full flex flex-col gap-4 sm:gap-6 rounded-md border border-gray-200 bg-white p-5 sm:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <HeroText
                        title="Credentials"
                        description="Manage your verified identity documents and certificates"
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
                                    documentType={cred.documentType}
                                    issuingCountry={cred.issuingCountry}
                                    expiryDate={cred.expiryDate}
                                    documentNumber={cred.documentNumber}
                                    onRemove={(id) => {
                                        const cred = credentials.find((c) => c.id === id);
                                        setRemoveTarget({ id, title: cred?.title ?? "this credential" });
                                    }}
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
                onDocumentSelect={handleDocumentSelect}
                existingCredentialIds={existingIds}
                yotiDocuments={yotiDocuments}
                yotiLoading={yotiLoading}
            />

            <RemoveCredentialModal
                isOpen={removeTarget !== null}
                onClose={() => setRemoveTarget(null)}
                onConfirm={handleConfirmRemove}
                credentialTitle={removeTarget?.title ?? ""}
                isRemoving={isRemoving}
            />
        </>
    );
}
