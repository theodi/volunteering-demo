"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCredentials } from "@/app/lib/hooks/useCredentials";
import type { PodCredential } from "@/app/lib/hooks/useCredentials";
import { HeroText } from "@/app/components/HeroText";
import { Button } from "@/app/components/Button";


type PageProps = {
  params: Promise<{ documentType: string }>;
};

/** Turn "DRIVING_LICENCE" → "Driving Licence" */
function humanLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function IssueCredentialPage({ params }: PageProps) {
  const { documentType: rawType } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCredential } = useCredentials();

  const label = humanLabel(rawType);
  const country = searchParams.get("country") ?? "";

  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = documentNumber.trim() && expiryDate && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const credential: PodCredential = {
        id: `cred-${new Date(now).getTime()}`,
        title: label,
        issuer: `Mock ${label} Authority`,
        requirementUri: `https://id.volunteeringdata.io/document/${rawType}`,
        issuerUri: `https://mock-issuer.volunteeringdata.io/${rawType.toLowerCase().replace(/_/g, "-")}`,
        status: "verified",
        validFrom: now,
        documentType: rawType,
        issuingCountry: country,
        documentNumber: documentNumber.trim(),
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
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-lg font-semibold text-black">
            {label} credential issued
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Redirecting to your credentials…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-6 font-sans sm:px-6 lg:px-8">
      <div>
        <button
          onClick={() => router.push("/credentials")}
          className="mb-4 text-sm text-slate-500 hover:text-black transition"
        >
          ← Back to Credentials
        </button>

        <HeroText
          title={`Issue ${label}`}
          description={`Complete the details below to issue a ${label.toLowerCase()} credential for ${country}.`}
          as="h2"
          titleClassName="text-xl !sm:text-2xl font-semibold !text-black leading-tight tracking-tight"
          descriptionClassName="!mt-0 !text-sm !leading-relaxed !text-slate-700"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="doc-number" className="block text-sm font-medium text-gray-500">
                Document Number
              </label>
              <input
                id="doc-number"
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. 123456789"
                autoComplete="off"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-500">
                Expiry Date
              </label>
              <input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit}
          className="w-full rounded-lg! border-none! bg-primary! py-3! hover:bg-primary/90!"
        >
          {submitting ? "Issuing…" : `Issue ${label}`}
        </Button>
      </form>
    </div>
  );
}
