/**
 * Mock issuer document catalogue.
 *
 * Document types and their supported issuing countries, drawn from the
 * Yoti Digital ID supported documents list. Used by the mock issuer page
 * to let a volunteer simulate receiving an identity document credential.
 *
 * Each issued credential is written to the volunteer's Solid Pod and can
 * later be read by the NVS portal when performing a background check.
 *
 * TODO: (yoti-integration): Replace this hardcoded catalogue with a live call
 * to the Yoti IDV API once the service is available. The API endpoint is:
 *
 *   GET https://api.yoti.com/idverify/v1/supported-documents?includeNonLatin=true
 *
 * Or via the Node SDK:
 *   import { IDVClient } from "yoti";
 *   const idvClient = new IDVClient(process.env.YOTI_CLIENT_SDK_ID!, pemString);
 *   const supported = await idvClient.getSupportedDocuments();
 *   const countries = supported.getSupportedCountries();
 *
 * Create an API route at `app/api/yoti/supported-documents/route.ts` that
 * calls the SDK and returns the normalised country/document list. The mock
 * issuer page can then `fetch("/api/yoti/supported-documents")` instead of
 * importing this file directly.
 *
 * Required env vars (from Yoti Hub sandbox):
 *   YOTI_CLIENT_SDK_ID  — Client SDK ID
 *   YOTI_PEM_KEY        — PEM private key content (or YOTI_PEM_PATH for a file path)
 */

export type DocumentType = "PASSPORT" | "DRIVING_LICENCE" | "NATIONAL_ID";

export type SupportedCountry = {
  /** ISO 3166-1 alpha-3 code, e.g. "GBR" */
  code: string;
  /** Human-readable name, e.g. "United Kingdom" */
  name: string;
};

export type MockDocumentType = {
  /** Yoti document type identifier */
  type: DocumentType;
  /** Human-readable label shown in the UI */
  label: string;
  /** Short description shown in the modal */
  description: string;
  /** Volunteering ontology IRI for this document type */
  requirementUri: string;
  /** Mock issuer IRI */
  issuerUri: string;
  /** Mock issuer display name */
  issuerName: string;
  /** Countries that support this document type */
  supportedCountries: SupportedCountry[];
};

// ---------------------------------------------------------------------------
// Supported countries per document type (sourced from Yoti Digital ID docs)
// ---------------------------------------------------------------------------

const PASSPORT_COUNTRIES: SupportedCountry[] = [
  { code: "GBR", name: "United Kingdom" },
  { code: "IRL", name: "Ireland" },
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "AUS", name: "Australia" },
  { code: "NZL", name: "New Zealand" },
  { code: "DEU", name: "Germany" },
  { code: "FRA", name: "France" },
  { code: "ESP", name: "Spain" },
  { code: "ITA", name: "Italy" },
  { code: "NLD", name: "Netherlands" },
  { code: "BEL", name: "Belgium" },
  { code: "POL", name: "Poland" },
  { code: "PRT", name: "Portugal" },
  { code: "SWE", name: "Sweden" },
  { code: "NOR", name: "Norway" },
  { code: "DNK", name: "Denmark" },
  { code: "FIN", name: "Finland" },
  { code: "CHE", name: "Switzerland" },
  { code: "AUT", name: "Austria" },
  { code: "IND", name: "India" },
  { code: "PAK", name: "Pakistan" },
  { code: "BGD", name: "Bangladesh" },
  { code: "NGA", name: "Nigeria" },
  { code: "GHA", name: "Ghana" },
  { code: "ZAF", name: "South Africa" },
  { code: "KEN", name: "Kenya" },
  { code: "BRA", name: "Brazil" },
  { code: "MEX", name: "Mexico" },
  { code: "ARG", name: "Argentina" },
  { code: "COL", name: "Colombia" },
  { code: "JPN", name: "Japan" },
  { code: "CHN", name: "China" },
  { code: "KOR", name: "South Korea" },
  { code: "SGP", name: "Singapore" },
  { code: "MYS", name: "Malaysia" },
  { code: "PHL", name: "Philippines" },
  { code: "RUS", name: "Russia" },
  { code: "UKR", name: "Ukraine" },
  { code: "ROU", name: "Romania" },
  { code: "HUN", name: "Hungary" },
  { code: "CZE", name: "Czechia" },
  { code: "SVK", name: "Slovakia" },
  { code: "HRV", name: "Croatia" },
  { code: "BGR", name: "Bulgaria" },
  { code: "GRC", name: "Greece" },
  { code: "TUR", name: "Turkey" },
  { code: "EGY", name: "Egypt" },
  { code: "MAR", name: "Morocco" },
  { code: "ETH", name: "Ethiopia" },
  { code: "TZA", name: "Tanzania" },
  { code: "UGA", name: "Uganda" },
  { code: "ZMB", name: "Zambia" },
  { code: "ZWE", name: "Zimbabwe" },
];

const DRIVING_LICENCE_COUNTRIES: SupportedCountry[] = [
  { code: "GBR", name: "United Kingdom" },
  { code: "IRL", name: "Ireland" },
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "AUS", name: "Australia" },
  { code: "NZL", name: "New Zealand" },
  { code: "DEU", name: "Germany" },
  { code: "FRA", name: "France" },
  { code: "ESP", name: "Spain" },
  { code: "ITA", name: "Italy" },
  { code: "NLD", name: "Netherlands" },
  { code: "BEL", name: "Belgium" },
  { code: "POL", name: "Poland" },
  { code: "PRT", name: "Portugal" },
  { code: "SWE", name: "Sweden" },
  { code: "NOR", name: "Norway" },
  { code: "DNK", name: "Denmark" },
  { code: "FIN", name: "Finland" },
  { code: "CHE", name: "Switzerland" },
  { code: "AUT", name: "Austria" },
  { code: "IND", name: "India" },
  { code: "NGA", name: "Nigeria" },
  { code: "ZAF", name: "South Africa" },
  { code: "BRA", name: "Brazil" },
  { code: "MEX", name: "Mexico" },
  { code: "JPN", name: "Japan" },
  { code: "KOR", name: "South Korea" },
  { code: "SGP", name: "Singapore" },
  { code: "MYS", name: "Malaysia" },
  { code: "PHL", name: "Philippines" },
  { code: "RUS", name: "Russia" },
  { code: "UKR", name: "Ukraine" },
  { code: "ROU", name: "Romania" },
  { code: "HUN", name: "Hungary" },
  { code: "CZE", name: "Czechia" },
  { code: "HRV", name: "Croatia" },
  { code: "BGR", name: "Bulgaria" },
  { code: "GRC", name: "Greece" },
  { code: "TUR", name: "Turkey" },
  { code: "ZMB", name: "Zambia" },
  { code: "MWI", name: "Malawi" },
  { code: "TZA", name: "Tanzania" },
  { code: "UGA", name: "Uganda" },
  { code: "GHA", name: "Ghana" },
  { code: "KEN", name: "Kenya" },
];

const NATIONAL_ID_COUNTRIES: SupportedCountry[] = [
  { code: "DEU", name: "Germany" },
  { code: "FRA", name: "France" },
  { code: "ESP", name: "Spain" },
  { code: "ITA", name: "Italy" },
  { code: "NLD", name: "Netherlands" },
  { code: "BEL", name: "Belgium" },
  { code: "POL", name: "Poland" },
  { code: "PRT", name: "Portugal" },
  { code: "SWE", name: "Sweden" },
  { code: "CHE", name: "Switzerland" },
  { code: "AUT", name: "Austria" },
  { code: "GRC", name: "Greece" },
  { code: "ROU", name: "Romania" },
  { code: "HUN", name: "Hungary" },
  { code: "CZE", name: "Czechia" },
  { code: "SVK", name: "Slovakia" },
  { code: "HRV", name: "Croatia" },
  { code: "BGR", name: "Bulgaria" },
  { code: "IND", name: "India" },
  { code: "PAK", name: "Pakistan" },
  { code: "NGA", name: "Nigeria" },
  { code: "ZAF", name: "South Africa" },
  { code: "GHA", name: "Ghana" },
  { code: "EGY", name: "Egypt" },
  { code: "MAR", name: "Morocco" },
  { code: "KEN", name: "Kenya" },
  { code: "TZA", name: "Tanzania" },
  { code: "UGA", name: "Uganda" },
  { code: "SGP", name: "Singapore" },
  { code: "MYS", name: "Malaysia" },
  { code: "PHL", name: "Philippines" },
  { code: "IDN", name: "Indonesia" },
  { code: "THA", name: "Thailand" },
  { code: "MEX", name: "Mexico" },
  { code: "COL", name: "Colombia" },
  { code: "ARG", name: "Argentina" },
  { code: "BRA", name: "Brazil" },
  { code: "PER", name: "Peru" },
  { code: "TUR", name: "Turkey" },
  { code: "ARE", name: "United Arab Emirates" },
  { code: "SAU", name: "Saudi Arabia" },
  { code: "UKR", name: "Ukraine" },
  { code: "RUS", name: "Russia" },
  { code: "ISR", name: "Israel" },
];

// ---------------------------------------------------------------------------
// Document type catalogue
// ---------------------------------------------------------------------------

export const MOCK_DOCUMENT_TYPES: MockDocumentType[] = [
  {
    type: "PASSPORT",
    label: "Passport",
    description: "Government-issued international travel document with photo ID.",
    requirementUri: "https://id.volunteeringdata.io/document/Passport",
    issuerUri: "https://mock-issuer.volunteeringdata.io/passport",
    issuerName: "Mock Passport Authority",
    supportedCountries: PASSPORT_COUNTRIES,
  },
  {
    type: "DRIVING_LICENCE",
    label: "Driving Licence",
    description: "Government-issued driving licence with photo ID.",
    requirementUri: "https://id.volunteeringdata.io/document/DrivingLicence",
    issuerUri: "https://mock-issuer.volunteeringdata.io/driving-licence",
    issuerName: "Mock Driving Licence Authority",
    supportedCountries: DRIVING_LICENCE_COUNTRIES,
  },
  {
    type: "NATIONAL_ID",
    label: "National ID Card",
    description: "Government-issued national identity card.",
    requirementUri: "https://id.volunteeringdata.io/document/NationalID",
    issuerUri: "https://mock-issuer.volunteeringdata.io/national-id",
    issuerName: "Mock National ID Authority",
    supportedCountries: NATIONAL_ID_COUNTRIES,
  },
];

/** Lookup a document type definition by its type key. */
export function getMockDocumentType(type: DocumentType): MockDocumentType | undefined {
  return MOCK_DOCUMENT_TYPES.find((d) => d.type === type);
}
