"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/components/Button";
import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";
import { LoadingScreen } from "@/app/components/LoadingScreen";
import { useCredentials } from "@/app/lib/hooks/useCredentials";
import Link from "next/link";

const VERIFICATION_STEPS = [
    "Identity confirmed via GOV.UK One Login",
    "DBS record matched to applicant",
    "Certificate status: No convictions found",
    "Digital credential ready to collect",
] as const;

export default function VerifyCredentialPage() {
    const params = useParams();
    const router = useRouter();
    const credentialId = params.id as string;

    const { credentials, isLoading, updateStatus } = useCredentials();
    const [isProcessing, setIsProcessing] = useState(false);
    const [action, setAction] = useState<"claim" | "unclaim" | null>(null);

    // Find the credential from the Pod data
    const credential = credentials.find((c) => c.id === credentialId);
    const title = credential?.title ?? "UK DBS Check";
    const issuer = credential?.issuer ?? "Disclosure and Barring Service GOV.UK";
    const isVerified = credential?.status === "verified";

    const handleClaim = async () => {
        setAction("claim");
        setIsProcessing(true);
        try {
            await updateStatus(credentialId, "verified");
            router.push("/credentials");
        } catch (err) {
            console.error("Failed to claim credential:", err);
            setIsProcessing(false);
            setAction(null);
        }
    };

    const handleUnclaim = async () => {
        setAction("unclaim");
        setIsProcessing(true);
        try {
            await updateStatus(credentialId, "collect");
            router.push("/credentials");
        } catch (err) {
            console.error("Failed to unclaim credential:", err);
            setIsProcessing(false);
            setAction(null);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-white font-sora">
            <NVSNavbar
                title="Disclosure and Barring Service"
                subtitle="Digital Credential Verification"
                showUser={false}
            />

            {/* Main content */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
                    <Link href="/credentials" className="text-earth-blue underline underline-offset-2 hover:text-blue-custom">
                        Credentials
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">Verify credential</span>
                </nav>

                {/* Credential header */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-14 sm:w-14">
                        <img
                            src="/credential-icon.png"
                            alt=""
                            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                            aria-hidden
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
                        <p className="mt-0.5 text-sm text-gray-500">{issuer}</p>
                    </div>
                </div>

                {/* Status panel */}
                {isVerified ? (
                    <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-amber-600 sm:h-7 sm:w-7" />
                            <div>
                                <h3 className="text-base font-bold text-amber-800 sm:text-lg">
                                    Credential Already Claimed
                                </h3>
                                <p className="mt-0.5 text-sm text-amber-700">
                                    This credential is currently verified. You can unclaim it to
                                    remove it from your verified credentials.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheckIcon className="h-6 w-6 shrink-0 text-green-600 sm:h-7 sm:w-7" />
                            <div>
                                <h3 className="text-base font-bold text-green-800 sm:text-lg">
                                    Verification Complete
                                </h3>
                                <p className="mt-0.5 text-sm text-green-700">
                                    This credential has been verified and is ready to collect.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification details */}
                <section className="mt-8">
                    <h3 className="text-base font-bold text-green-deep sm:text-lg">
                        Verification Steps
                    </h3>
                    <ul className="mt-4 space-y-3">
                        {VERIFICATION_STEPS.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                <span className="text-sm text-gray-700 sm:text-base">{step}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Credential summary */}
                <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5 sm:p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                        Credential Summary
                    </h3>
                    <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-medium text-gray-500">Type</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-gray-900">{title}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500">Issuer</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-gray-900">{issuer}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500">Issue Date</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500">Status</dt>
                            <dd className={`mt-0.5 text-sm font-semibold ${isVerified ? "text-amber-700" : "text-green-700"}`}>
                                {isVerified ? "Verified — Claimed" : "Clear — No convictions"}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Action button */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        variant={action === "unclaim" ? "secondary" : "primary"}
                        size="lg"
                        onClick={isVerified ? handleUnclaim : handleClaim}
                        disabled={isProcessing}
                        className="rounded-none!"
                    >
                        {isProcessing
                            ? (action === "unclaim" ? "Removing…" : "Claiming…")
                            : (isVerified ? "Unclaim Credential" : "Claim Credential")
                        }
                    </Button>
                    <Link
                        href="/credentials"
                        className="text-sm text-earth-blue underline underline-offset-2 hover:text-blue-custom sm:ml-2"
                    >
                        Back to credentials
                    </Link>
                </div>

                {/* Legal notice */}
                <p className="mt-8 text-xs leading-relaxed text-gray-500">
                    This credential is issued under the{" "}
                    <strong>Disclosure and Barring Service</strong> and verified via{" "}
                    <strong>GOV.UK One Login</strong>. Data is stored in your Solid Pod and not
                    shared with third parties without your explicit consent. Governed by the{" "}
                    <strong>UK GDPR</strong> and <strong>Data Protection Act 2018</strong>.
                </p>
            </main>

            <NVSFooter />
        </div>
    );
}
