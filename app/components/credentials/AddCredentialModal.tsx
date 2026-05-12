"use client";

import { ModalWrapper } from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { CredentialCard } from "./CredentialCard";
import { MOCK_DOCUMENT_TYPES } from "@/app/lib/data/mockIssuerDocuments";
import type { DocumentType } from "@/app/lib/data/mockIssuerDocuments";
import { IdentificationIcon, DocumentTextIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export type CredentialType = {
    id: string;
    title: string;
    issuer: string;
    /** Volunteering ontology requirement IRI (e.g. https://ns.volunteeringdata.io/DBSCheck) */
    requirementUri: string;
    /** Issuer IRI (e.g. https://www.gov.uk/dbs) */
    issuerUri: string;
    icon?: string;
};

const AVAILABLE_CREDENTIALS: CredentialType[] = [
    {
        id: "dbs-check",
        title: "UK DBS Check",
        issuer: "Disclosure and Barring Service GOV.UK",
        requirementUri: "https://ns.volunteeringdata.io/DBSCheck",
        issuerUri: "https://www.gov.uk/government/organisations/disclosure-and-barring-service",
    },
    {
        id: "first-aid",
        title: "First Aid Certificate",
        issuer: "First Aid Service GOV.UK",
        requirementUri: "https://ns.volunteeringdata.io/FirstAidCertificate",
        issuerUri: "https://www.gov.uk/government/organisations/first-aid-service",
    },
];

export type AddCredentialModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (credential: CredentialType) => void;
    /** Called when the user picks an identity document type; parent handles the redirect */
    onDocumentSelect: (documentType: DocumentType) => void;
    /** IDs of credentials the user already has, so they can be highlighted */
    existingCredentialIds?: Set<string>;
};

const DOCUMENT_TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
    PASSPORT: <IdentificationIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    DRIVING_LICENCE: <CreditCardIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    NATIONAL_ID: <DocumentTextIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
};

export function AddCredentialModal({
    isOpen,
    onClose,
    onSelect,
    onDocumentSelect,
    existingCredentialIds = new Set(),
}: AddCredentialModalProps) {
    const handleSelect = (cred: CredentialType) => {
        onSelect(cred);
        onClose();
    };

    const handleDocumentSelect = (type: DocumentType) => {
        onDocumentSelect(type);
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

                {/* Standard credentials */}
                <div className="flex flex-col gap-2 px-5 pt-5 sm:px-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Certificates &amp; Checks
                    </h3>
                    <div className="flex flex-col gap-2.5">
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
                </div>

                {/* Identity document credentials */}
                <div className="flex flex-col gap-2 px-5 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Identity Documents
                    </h3>
                    <div className="flex flex-col gap-2.5">
                        {MOCK_DOCUMENT_TYPES.map((doc) => (
                            <button
                                key={doc.type}
                                onClick={() => handleDocumentSelect(doc.type)}
                                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-light-lavender/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <span className="mt-0.5">{DOCUMENT_TYPE_ICONS[doc.type]}</span>
                                <span className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                                    <span className="text-xs text-gray-500">{doc.description}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </ModalWrapper>
    );
}
