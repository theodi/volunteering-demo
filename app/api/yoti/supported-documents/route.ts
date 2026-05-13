import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { IDVClient } = require("yoti");

/**
 * GET /api/yoti/supported-documents
 *
 * Calls the Yoti IDV API to retrieve supported documents grouped by country,
 * then pivots the data into a document-type → countries[] map so the UI can
 * look up which countries support a given document type (PASSPORT, etc.).
 *
 * Required env vars:
 *   YOTI_CLIENT_SDK_ID  – from Yoti Hub
 *   YOTI_PEM_PATH       – path to the .pem file (relative to project root)
 */

type YotiSupportedDocument = {
  getType: () => string;
};

type YotiSupportedCountry = {
  getCode: () => string;
  getSupportedDocuments: () => YotiSupportedDocument[];
};

type YotiSupportedDocumentsResponse = {
  getSupportedCountries: () => YotiSupportedCountry[];
};

/** Shape returned to the client */
export type SupportedDocumentEntry = {
  /** e.g. "PASSPORT", "DRIVING_LICENCE", "NATIONAL_ID" */
  type: string;
  /** ISO 3166-1 alpha-3 country codes that support this document type */
  countryCodes: string[];
};

export async function GET() {
  const sdkId = process.env.YOTI_CLIENT_SDK_ID;
  const pemPath = process.env.YOTI_PEM_PATH;

  if (!sdkId || !pemPath) {
    return NextResponse.json(
      { error: "Yoti credentials not configured (YOTI_CLIENT_SDK_ID / YOTI_PEM_PATH)" },
      { status: 500 },
    );
  }

  const fullPemPath = path.resolve(process.cwd(), pemPath);
  let pem: string;
  try {
    pem = fs.readFileSync(fullPemPath, "utf-8");
  } catch {
    return NextResponse.json(
      { error: `PEM file not found at ${pemPath}` },
      { status: 500 },
    );
  }

  try {
    const idvClient = new IDVClient(sdkId, pem);
    const response: YotiSupportedDocumentsResponse =
      await idvClient.getSupportedDocuments(true /* includeNonLatin */);

    // Yoti returns countries → documents[]. Pivot to documents → countries[].
    const docCountriesMap = new Map<string, string[]>();

    for (const country of response.getSupportedCountries()) {
      const countryCode = country.getCode();
      for (const doc of country.getSupportedDocuments()) {
        const docType = doc.getType();
        if (!docCountriesMap.has(docType)) {
          docCountriesMap.set(docType, []);
        }
        docCountriesMap.get(docType)!.push(countryCode);
      }
    }

    const result: SupportedDocumentEntry[] = Array.from(docCountriesMap.entries()).map(
      ([type, countryCodes]) => ({ type, countryCodes: countryCodes.sort() }),
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Yoti getSupportedDocuments failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch supported documents from Yoti" },
      { status: 502 },
    );
  }
}
