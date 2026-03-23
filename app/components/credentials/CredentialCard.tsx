"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button";

export type CredentialStatus = "verified" | "collect";

export type CredentialCardProps = {
    title: string;
    issuer: string;
    /** Unique credential ID, used for navigation to the verify page */
    credentialId?: string;
    status?: CredentialStatus;
    /** When true, hides the status badge (e.g. for use in selection modals) */
    hideStatus?: boolean;
    /** Makes the entire card clickable */
    onClick?: () => void;
    /** Extra classes for the outer container */
    className?: string;
};

export function CredentialCard({ title, issuer, credentialId, status = "collect", hideStatus = false, onClick, className = "" }: CredentialCardProps) {
    const router = useRouter();
    const isVerified = status === "verified";
    const isClickable = onClick != null;

    const Tag = isClickable ? "button" : "div";

    const handleCollect = () => {
        if (!credentialId || isVerified) return;
        // Store credential info for the verify page to read
        sessionStorage.setItem(`credential-verify-${credentialId}`, JSON.stringify({ title, issuer }));
        router.push(`/credentials/verify/${credentialId}`);
    };

    return (
        <Tag
            type={isClickable ? "button" : undefined}
            onClick={onClick}
            className={`w-full flex items-start gap-3 rounded-[10px] border p-2.5 sm:p-5 transition text-left ${isVerified
                    ? "border-rose-lilac bg-light-lavender"
                    : "border-gray-200 bg-white"
                } ${isClickable ? "cursor-pointer hover:bg-gray-50" : ""} ${className}`}
        >
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

                {/* Status badge */}
                {!hideStatus && (
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={isVerified}
                        onClick={isVerified ? undefined : handleCollect}
                        className={`shrink-0 rounded-md! border-none! px-3! py-2! shadow-none! text-sm! font-medium! disabled:opacity-100! disabled:cursor-default! ${isVerified ? "cursor-default bg-lavender! text-primary!" : "bg-primary! text-white!"}`}
                    >
                        {isVerified ? "Verified" : "Collect"}
                    </Button>
                )}
            </div>

        </Tag>
    );
}
