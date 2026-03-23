"use client";

import { ModalWrapper } from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { CredentialCard } from "./CredentialCard";

export type CredentialType = {
    id: string;
    title: string;
    issuer: string;
    icon?: string;
};

const AVAILABLE_CREDENTIALS: CredentialType[] = [
    {
        id: "dbs-check",
        title: "UK DBS Check",
        issuer: "Disclosure and Barring Service GOV.UK",
    },
    {
        id: "first-aid",
        title: "First Aid Certificate",
        issuer: "First Aid Service GOV.UK",
    },
];

export type AddCredentialModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (credential: CredentialType) => void;
    /** IDs of credentials the user already has, so they can be highlighted */
    existingCredentialIds?: Set<string>;
};

export function AddCredentialModal({
    isOpen,
    onClose,
    onSelect,
    existingCredentialIds = new Set(),
}: AddCredentialModalProps) {
    const handleSelect = (cred: CredentialType) => {
        onSelect(cred);
        onClose();
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            className="!max-w-xl w-full !border-none !rounded-xl"
        >
            <section className="flex flex-col">
                {/* Header */}
                <ModalHeader title="Add Credential" onClose={onClose} />
                <p className="px-5 pt-3 text-sm text-gray-600 sm:px-6">
                    Select a credential type to verify
                </p>

                {/* Credential type list */}
                <div className="flex flex-col gap-2.5 px-5 py-5 sm:px-6 sm:py-6">
                    {AVAILABLE_CREDENTIALS.map((cred, index) => {
                        const alreadyAdded = existingCredentialIds.has(cred.id);
                        return (
                            <CredentialCard
                                key={`${cred.id}-${index}`}
                                title={cred.title}
                                issuer={cred.issuer}
                                hideStatus
                                onClick={() => handleSelect(cred)}
                                className={alreadyAdded ? "border-rose-lilac! bg-light-lavender! hover:bg-lavender/30!" : ""}
                            />
                        );
                    })}
                </div>
            </section>
        </ModalWrapper>
    );
}
