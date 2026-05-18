"use client";

import { useState, useMemo } from "react";
import { ModalWrapper } from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { SearchableDropdown } from "../SearchableDropdown";
import { Button } from "../Button";
import type { SupportedDocumentEntry } from "@/app/api/yoti/supported-documents/route";
import {
    IdentificationIcon,
    DocumentTextIcon,
    CreditCardIcon,
    GlobeAltIcon,
    BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

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

export type AddCredentialModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (credential: CredentialType) => void;
    /** Called when the user picks an identity document type; parent handles the redirect */
    onDocumentSelect: (documentType: string, countryCode: string) => void;
    /** IDs of credentials the user already has, so they can be highlighted */
    existingCredentialIds?: Set<string>;
    /** Live Yoti supported document types */
    yotiDocuments: SupportedDocumentEntry[];
    /** Whether the Yoti data is still loading */
    yotiLoading: boolean;
};

/** Human-readable labels and descriptions for known document types */
const DOCUMENT_TYPE_META: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    PASSPORT: {
        label: "Passport",
        description: "Government-issued international travel document with photo ID.",
        icon: <IdentificationIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    },
    DRIVING_LICENCE: {
        label: "Driving Licence",
        description: "Government-issued driving licence with photo ID.",
        icon: <CreditCardIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    },
    NATIONAL_ID: {
        label: "National ID Card",
        description: "Government-issued national identity card.",
        icon: <DocumentTextIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    },
    RESIDENCE_PERMIT: {
        label: "Residence Permit",
        description: "Government-issued residence permit.",
        icon: <BuildingLibraryIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    },
    TRAVEL_DOCUMENT: {
        label: "Travel Document",
        description: "Government-issued travel document.",
        icon: <GlobeAltIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />,
    },
};

const DEFAULT_ICON = <DocumentTextIcon className="h-5 w-5 text-primary shrink-0" aria-hidden />;

function getDocMeta(type: string) {
    return DOCUMENT_TYPE_META[type] ?? {
        label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Government-issued ${type.toLowerCase().replace(/_/g, " ")}.`,
        icon: DEFAULT_ICON,
    };
}

export function AddCredentialModal({
    isOpen,
    onClose,
    onSelect,
    onDocumentSelect,
    yotiDocuments,
    yotiLoading,
}: AddCredentialModalProps) {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedDocument, setSelectedDocument] = useState("");

    // Build a sorted list of unique country codes across all document types
    const countryOptions = useMemo(() => {
        const codes = new Set<string>();
        for (const doc of yotiDocuments) {
            for (const code of doc.countryCodes) {
                codes.add(code);
            }
        }
        return Array.from(codes).sort().map((code) => ({ value: code, label: code }));
    }, [yotiDocuments]);

    // Filter document types to those that support the selected country
    const documentOptions = useMemo(() => {
        if (!selectedCountry) return [];
        return yotiDocuments
            .filter((doc) => doc.countryCodes.includes(selectedCountry))
            .map((doc) => {
                const meta = getDocMeta(doc.type);
                return {
                    value: doc.type,
                    label: meta.label,
                    description: meta.description,
                    icon: meta.icon,
                };
            });
    }, [yotiDocuments, selectedCountry]);

    const handleSelect = (cred: CredentialType) => {
        onSelect(cred);
        onClose();
    };

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        setSelectedDocument(""); // Reset document when country changes
    };

    const handleDocumentChange = (value: string) => {
        setSelectedDocument(value);
    };

    const handleNext = () => {
        if (!selectedDocument || !selectedCountry) return;
        onDocumentSelect(selectedDocument, selectedCountry);
        onClose();
        setSelectedCountry("");
        setSelectedDocument("");
    };

    const handleClose = () => {
        setSelectedCountry("");
        setSelectedDocument("");
        onClose();
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            className="!max-w-xl w-full !border-none !rounded-xl"
            ariaLabelledBy="add-credential-title"
        >
            <section className="flex flex-col">
                {/* Header */}
                <ModalHeader title="Add Credential" onClose={handleClose} titleId="add-credential-title" />
                <p className="px-5 pt-3 text-sm text-gray-600 sm:px-6">
                    Select a credential type to verify
                </p>

                {/* Identity document credentials — country-first flow */}
                <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Identity Documents
                    </h3>

                    {yotiLoading ? (
                        <p className="py-4 text-center text-sm text-gray-400">Loading…</p>
                    ) : yotiDocuments.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-400">No document types available.</p>
                    ) : (
                        <>
                            {/* Country picker */}
                            <SearchableDropdown
                                options={countryOptions}
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                placeholder="Choose a country…"
                                searchPlaceholder="Search countries…"
                                label="Select your country"
                            />

                            {/* Document type picker — disabled until country is selected */}
                            <SearchableDropdown
                                options={documentOptions}
                                value={selectedDocument}
                                onChange={handleDocumentChange}
                                placeholder="Choose a document type…"
                                searchPlaceholder="Search document types…"
                                label="Select document type"
                                disabled={!selectedCountry}
                            />

                            {/* Next button — disabled until both selections are made */}
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNext}
                                disabled={!selectedCountry || !selectedDocument}
                                className="mt-1 w-full rounded-md! border-none! bg-primary! py-2.5! text-sm! font-medium! shadow-sm! disabled:opacity-50!"
                            >
                                Next
                            </Button>
                        </>
                    )}
                </div>
            </section>
        </ModalWrapper>
    );
}
