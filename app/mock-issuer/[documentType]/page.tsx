"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCredentials } from "@/app/lib/hooks/useCredentials";
import type { PodCredential } from "@/app/lib/hooks/useCredentials";
import { Button } from "@/app/components/Button";

type PageProps = {
  params: Promise<{ documentType: string }>;
};

/** Turn "DRIVING_LICENCE" → "Driving Licence" */
function humanLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MockIssuerPage({ params }: PageProps) {
  const { documentType: rawType } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCredential } = useCredentials();

  const label = humanLabel(rawType);
  const country = searchParams.get("country") ?? "";

  // ── Form state ─────────────────────────────────────────────────────────
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!country) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Missing country</h1>
        <p className="mt-2 text-sm text-gray-500">No issuing country was provided.</p>
        <Button variant="secondary" className="mt-6" onClick={() => router.push("/credentials")}>
          Back to Credentials
        </Button>
      </main>
    );
  }

  const canSubmit = documentNumber && expiryDate && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const credential: PodCredential = {
        id: `${rawType.toLowerCase()}-${Date.now()}`,
        title: label,
        issuer: `Mock ${label} Authority`,
        requirementUri: `https://id.volunteeringdata.io/document/${rawType}`,
        issuerUri: `https://mock-issuer.volunteeringdata.io/${rawType.toLowerCase().replace(/_/g, "-")}`,
        status: "verified",
        validFrom: new Date().toISOString(),
        documentType: rawType,
        issuingCountry: country,
        documentNumber,
        expiryDate,
      };

      await addCredential(credential);
      setSuccess(true);
      setTimeout(() => router.push("/credentials"), 1500);
    } catch (err) {
      console.error("Failed to issue credential:", err);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Credential Issued</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your {label} credential has been written to your Solid Pod.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-6 rounded-md border border-gray-200 bg-white p-5 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/credentials")}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Mock {label} Issuer
            </h1>
            <p className="text-sm text-gray-500">
              Simulate receiving a {label.toLowerCase()} credential — {country}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Document number */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Document Number</span>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. 123456789"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          {/* Expiry date */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Expiry Date</span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSubmit}
            className="mt-2 w-full rounded-md! border-none! bg-primary! py-2.5! text-sm! font-medium! shadow-sm! disabled:opacity-50!"
          >
            {submitting ? "Issuing…" : `Issue ${label} Credential`}
          </Button>
        </form>
      </section>
    </main>
  );
}
