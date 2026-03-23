"use client";

import { Button } from "../Button";

export type CredentialStatus = "verified" | "collect";

export type CredentialCardProps = {
    title: string;
    issuer: string;
    status: CredentialStatus;
};

export function CredentialCard({ title, issuer, status }: CredentialCardProps) {
    const isVerified = status === "verified";

    return (
        <div
            className={`w-full flex items-start gap-3 rounded-[10px] border p-2.5 sm:p-5 transition ${isVerified
                    ? "border-rose-lilac bg-light-lavender"
                    : "border-gray-200 bg-white"
                }`}
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
                <Button
                    variant="primary"
                    size="sm"
                    disabled={isVerified}
                    className={`shrink-0 rounded-md! border-none! px-3! py-2! shadow-none! text-sm! font-medium! disabled:opacity-100! disabled:cursor-default! ${isVerified ? "cursor-default bg-lavender! text-primary!" : "bg-primary! text-white!"}`}
                >
                    {isVerified ? "Verified" : "Collect"}
                </Button>
            </div>

        </div>
    );
}
