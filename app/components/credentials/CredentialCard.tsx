"use client";

import { TrashIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export type CredentialStatus = "verified" | "collect";

export type CredentialCardProps = {
    title: string;
    issuer: string;
    /** Unique credential ID */
    credentialId?: string;
    status?: CredentialStatus;
    /** Optional document details */
    documentType?: string;
    issuingCountry?: string;
    expiryDate?: string;
    documentNumber?: string;
    /** Called when the user clicks the remove button (parent handles confirmation) */
    onRemove?: (credentialId: string) => void;
    /** Makes the entire card clickable */
    onClick?: () => void;
    /** Extra classes for the outer container */
    className?: string;
};

export function CredentialCard({
    title,
    issuer,
    credentialId,
    status = "collect",
    documentType,
    issuingCountry,
    expiryDate,
    documentNumber,
    onRemove,
    onClick,
    className = "",
}: CredentialCardProps) {
    const isVerified = status === "verified";
    const isClickable = onClick != null;

    const Tag = isClickable ? "button" : "div";

    const handleRemove = () => {
        if (!credentialId || !onRemove) return;
        onRemove(credentialId);
    };

    return (
        <Tag
            type={isClickable ? "button" : undefined}
            onClick={onClick}
            className={`w-full flex flex-col gap-2 rounded-[10px] border p-2.5 sm:p-5 transition text-left ${isVerified
                    ? "border-rose-lilac bg-light-lavender"
                    : "border-gray-200 bg-white"
                } ${isClickable ? "cursor-pointer hover:bg-gray-50" : ""} ${className}`}
        >
            <div className="flex items-start gap-3 w-full">
                {/* Credential icon */}
                <div className={`flex h-5 w-5 sm:w-9 sm:h-9 shrink-0 items-center justify-center rounded-sm p-2 ${isVerified ? "bg-white" : "bg-gray-100"}`}>
                    <img
                        src="/credential-icon.png"
                        alt=""
                        className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                        aria-hidden
                    />
                </div>

                <div className="w-full flex items-center justify-between">
                    {/* Text */}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {title}
                        </p>
                        <p className="text-xs text-gray-500 sm:text-sm">{issuer}</p>
                    </div>

                    {/* Verified badge + remove */}
                    <div className="flex items-center gap-2 shrink-0">
                        {isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-lavender px-2.5 py-1.5 text-xs font-medium text-primary sm:text-sm">
                                <CheckBadgeIcon className="h-4 w-4" aria-hidden />
                                Verified
                            </span>
                        )}
                        {onRemove && credentialId && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                title="Remove credential"
                            >
                                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Document details row */}
            {(issuingCountry || expiryDate || documentNumber) && (
                <div className="ml-8 sm:ml-12 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {issuingCountry && <span>Country: {issuingCountry}</span>}
                    {documentNumber && <span>Doc #: {documentNumber}</span>}
                    {expiryDate && <span>Expires: {expiryDate}</span>}
                </div>
            )}
        </Tag>
    );
}
