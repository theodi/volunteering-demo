# Software Requirements Specification: Volunteer Profile Manager

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Project:** Volunteer Profile Manager (Solid-based)

---

## 1\. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) describes the functional and non-functional requirements for the Volunteer Profile Manager: a Solid-based application that lets volunteers manage their profile in a Personal Online Data store (Pod), discover opportunities, and receive customised recommendations, including support for credential sharing (e.g. DBS) and LLM-driven recommendations.

### 1.2 Scope

- **In scope:** Volunteer discovery based on personal information; Pod setup and personal preferences; volunteer ontology–aligned skills and requirements; credential viewing and sharing (including DBS); customised opportunity recommendations using the existing volunteering API and an LLM; permission and consent for emergency contact data; UX aligned with reference designs (PDS credentials view, Randstad-style recommendations, govo.org-style search, Lunar AI–style LLM UX).

### 1.3 Definitions and Acronyms

| Term | Definition |
| :---- | :---- |
| **Pod** | Personal Online Data store (Solid storage) where the user’s data is stored. |
| **Solid** | Decentralised web platform; data is stored in Pods and accessed via WebID. |
| **WebID** | User’s global identifier and profile document in Solid. |
| **Volunteer ontology** | Vocabulary at [`https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/ontology/volunteer.ttl`](https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/ontology/volunteer.ttl) used for skills, requirements, causes, location, and time. |
| **DBS** | Disclosure and Barring Service (UK government) check; used here as an example of government-owned credential data. |
| **LLM** | Large Language Model (here: Anthropic). |
| **CSS** | Community Solid Server (reference Solid server). |

### 1.4 References

- [Volunteer Profile Manager – SkillsEditor (volunteer ontology skills/requirements)](https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/components/editor/SkillsEditor.tsx#L13-L113)  
- [Figma: Personal Data Store (PDS) – View credentials in a Pod](https://www.figma.com/proto/eywFX889vpkbxAcq3REmZD/Personal-Data-Store--PDS--design-examples---template--Community-?node-id=10-14156&p=f&t=YLXOoNpaLBROXJxU-0&scaling=scale-down&content-scaling=fixed&page-id=1%3A5&starting-point-node-id=67%3A42597)  
- [govo.org – Volunteer search interface example](https://govo.org/)  
- Volunteering Data API (already integrated): `https://api.volunteeringdata.io/activity_by_location.json`  
- Volunteer ontology: [`https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/ontology/volunteer.ttl`](https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/ontology/volunteer.ttl)

---

## 2\. Overall Description

### 2.1 Product Perspective

The application is a Solid app that:

1. Lets volunteers set up and use a Pod for personal and volunteering data.  
2. Stores general personal preferences (aligned with data typically held in a CSS/profile extension): location, phone number, and similar contact/preference data.  
3. Stores volunteering-specific profile data (locations, availability, skills, equipment/resources, causes) in the volunteer ontology so it can be used in a recommendation phase.  
4. Provides a credentials view (Pod-stored credentials, including government-owned data such as a valid DBS document).  
5. Supports credential sharing (e.g. sharing a valid DBS document) and customised recommendations using the existing Volunteering Profile Manager API.  
6. Asks for permission to collect data needed to contact volunteers in an emergency on first use.

### 2.2 User Classes

- **Volunteers:** People who create and maintain a volunteer profile, view credentials, consent to emergency contact data, search opportunities, and use LLM-based recommendations.

### 2.3 Operating Environment

- Modern browsers with Solid/OIDC support.  
- Next.js application; optional local CSS (or other Solid server) for development.  
- Access to the volunteeringdata.io API and (for recommendations) Anthropic API.

---

## 3\. System Features (Functional Requirements)

### 3.1 Volunteer Discovery and Pod Setup

#### 3.1.1 Pod and personal preferences

- **FR-1.1** The system shall allow the user to use a Solid Pod (discovered from the WebID) as the storage for all volunteer and preference data.  
- **FR-1.2** The system shall support storing general personal preferences in the Pod, aligned with the kind of data typically held in a CSS profile extension:  
  - Location (address/postcode and/or coordinates)  
  - Phone number  
  - Other contact and preference fields as defined by the shared data model (to be aligned with the “CSS profile extension” dataset).  
- **FR-1.3** The system shall **read** standard profile information (e.g. name, address, photo) from the WebID and other extended profile documents where available, and **write** only to the volunteer profile document (and any explicitly defined preference/credential documents), not to the WebID document unless a dedicated, consent-based flow is defined.

#### 3.1.2 Volunteer profile and volunteer ontology

- **FR-1.4** The system shall maintain an extended volunteer profile document in the Pod (e.g. `{pod}/volunteer/profile`) conforming to the volunteer ontology and/or SHACL/shape used in the application.  
- **FR-1.5** The system shall support preferred locations (point \+ radius) and preferred times (day of week \+ time of day) as defined in the volunteer ontology.  
- **FR-1.6** The system shall support charitable causes (preferred causes) from the volunteer ontology and allow selecting from the defined cause list.

#### 3.1.3 Skills and requirements (volunteer ontology)

- **FR-1.7** Work skills and equipment/resources (requirements) shall be written using the volunteer ontology so that the same data can be used in the recommendation phase.   
- **FR-1.8** The set of skills and requirements presented in the UI shall be those generated from the volunteer ontology. The canonical list is derived from [SkillsEditor](https://github.com/theodi/volunteer-profile-manager/blob/a82fc2ed23751acd0ff3458ae801c3af8b911f6e/src/components/editor/SkillsEditor.tsx#L13-L113) and aligned with the ontology:  
  - **Skills:** Grouped by categories (Personal Qualities, Communication, Teamwork, Safety & Awareness, Practical Skills, Technology, Local Knowledge). Examples: EmpathyAndCompassion, ClearSpokenCommunication, BasicFirstAidKnowledge, Driving, BasicITSkills, etc.  
  - **Requirements (equipment/resources):** Grouped by categories (Physical & Personal, Clothing, Equipment, Vehicles, Facilities). Examples: PhysicalStamina, SturdyFootwear, PhoneAndPowerBank, FourByFourVehicle, Venue, etc.  
- **FR-1.9** The application shall persist skills and requirements in the volunteer profile document using the ontology predicates (e.g. `hasSkill`, `hasRequirement`) and ontology URIs, so that recommendation and search logic can consume them without transformation.

### 3.2 Credentials View in the Pod

- **FR-2.1** The system shall provide a page to view credentials stored in the user’s Pod, with a UX similar to the [Figma PDS design – View credentials in a Pod](https://www.figma.com/proto/eywFX889vpkbxAcq3REmZD/Personal-Data-Store--PDS--design-examples---template--Community-?node-id=10-14156&p=f&t=YLXOoNpaLBROXJxU-0&scaling=scale-down&content-scaling=fixed&page-id=1%3A5&starting-point-node-id=67%3A42597).  
- **FR-2.2** The credentials view shall list credentials the user has in their Pod (type and summary), and allow viewing details of selected credentials where the data model supports it.

### 3.3 Credential Sharing (including government-owned data)

- **FR-3.1** The system shall support **showing government-owned data** as a shareable credential, in particular, the ability to **share a valid DBS document** (or equivalent) as a credential.  
- **FR-3.2** The system shall support customised recommendations that take into account profile data (locations, skills, requirements, causes) and the existing Volunteering Profile Manager API (already integrated in the project).

### 3.4 Permission and Emergency Contact Data

- **FR-4.1** When the user first reaches the application (or first use after consent has not yet been given), the system shall show a screen/modal pop-up that asks for permission to collect data in order to contact volunteers in an emergency.  
- **FR-4.2** The system shall record the user’s consent (or refusal) and only collect/store emergency-contact-related data in accordance with that choice.

### 3.5 Opportunity Search and Recommendations

- **FR-5.1** The system shall provide opportunity search using the existing API (e.g. `activity_by_location` and any other endpoints already integrated) and allow filtering/display of results (e.g. by location, text search).  
- **FR-5.2** Search UI and behaviour shall be inspired by volunteer search interfaces such as [govo.org](https://govo.org/) (search experience and layout).  
- **FR-5.3** Recommendations (customised to the volunteer’s profile) shall be presented with a visual style similar to the Randstad user interface (e.g. clear cards, emphasis on match/relevance, organisation and role information).  
- **FR-5.4** Results shall support either: (a) details for expressing interest (e.g. email/phone), or (b) an external apply link, as provided by the API or linked data.

### 3.6 Customised Recommendations via LLM

- **FR-6.1** The system shall provide customised recommendations that use an LLM to improve relevance or explanation of recommendations (e.g. matching reasoning, summarisation, or ranking).  
- **FR-6.2** The LLM provider shall be Anthropic (model and API to be chosen per project constraints).  
- **FR-6.3** The UX for the LLM-driven recommendation experience shall be similar to the **Lunar AI demo** (conversational or guided interaction, clear presentation of recommendations and reasoning).  
- **FR-6.4** This experience shall be implemented as a dedicated page within the volunteer application (e.g. “Recommendations” or “AI Recommendations”), not a separate app.

---

## 4\. External Interface Requirements

### 4.1 User Interfaces

- **UI-1** Volunteer profile editor: locations, availability, skills, requirements, causes; consistent with current tabbed design; skills/requirements aligned with volunteer ontology.  
- **UI-2** Credentials view: page similar to the Figma PDS “View credentials in a Pod” design.  
- **UI-3** First-time permission screen: clear request for permission to collect data to contact volunteers in an emergency.  
- **UI-4** Opportunity search: search inputs and results list; inspiration from govo.org.  
- **UI-5** Recommendations view: Randstad-like presentation of customised recommendations.  
- **UI-6** LLM recommendations page: Lunar AI–style UX, Anthropic-backed; page within the volunteer app.

### 4.2 Hardware Interfaces

- No specific hardware beyond standard web platform (geolocation optional for location).

### 4.3 Software Interfaces

- **Solid:** Pod storage, WebID, OIDC authentication (e.g. Inrupt/lib).  
- **Volunteering API:** `https://api.volunteeringdata.io/` (existing integration).  
- **Anthropic API:** For LLM-based recommendation features.  
- **Geocoding:** Existing service (e.g. Nominatim) for address/postcode resolution.

### 4.4 Communications

- HTTPS for all external APIs and Solid.  
- OIDC for authentication with Solid Identity Provider.

---

## 5\. Non-Functional Requirements

### 5.1 Performance

- Profile load and save should feel responsive; opportunity search results should load within acceptable time (e.g. \< 5 s under normal conditions).  
- LLM recommendation requests should have clear loading and error states; timeouts and retries should be defined.

### 5.2 Security and Privacy

- No volunteer data written to the WebID document except via an explicit, consent-based flow.  
- Emergency contact data collected only after explicit permission (FR-4.1, FR-4.2).  
- Credential viewing and sharing must respect Solid access control and user consent.

### 5.3 Usability

- UX aligned with reference designs: PDS credentials view (Figma), Randstad-like recommendations, govo.org-like search, Lunar AI–style LLM page.  
- Accessibility: follow WCAG 2.1 Level AA where feasible (key flows: profile edit, consent, search, recommendations).

### 5.4 Data and Ontology

- Volunteer profile data must conform to the volunteer ontology and application shapes (SHACL/Shex).  
- Skills and requirements must be stored with ontology URIs so the recommendation phase can consume them without ad hoc mapping.

---

## 6\. Appendices

### Appendix A: Skills and Requirements (Volunteer Ontology)

Skills and requirements are defined by the volunteer ontology and grouped in the UI as below. All must be stored with URIs under `https://id.volunteeringdata.io/schema/<Id>`.

**Skills (by category):**

- **Personal Qualities:** EmpathyAndCompassion, CalmnessUnderPressure, PatienceAndUnderstanding, ReliabilityAndTrustworthiness, RespectForProfessionalBoundaries, CulturalSensitivity, TraumaInformedAwareness, ConflictDeescalation  
- **Communication:** ClearSpokenCommunication, ActiveListening, AbilityToRelayAccurateInformation, SupportingPeopleViaPhoneOnline, UseOfRadiosAndWalkieTalkies, ConfidenceEngagingWithPublicOrGroups  
- **Teamwork:** AbilityToWorkCooperatively, AbilityToWorkIndependently, LeadingSmallGroupsOrTasks, ManagingConflictWithinTeams, SupportingOrMentoringNewVolunteers, UnderstandingEmergencyBriefingsAndInstructions  
- **Safety & Awareness:** BasicSafeguardingKnowledge, RiskAwareness, SafeManualHandling, IncidentReporting, BasicFirstAidKnowledge, FireSafetyAwareness, WaterSafetyAwareness  
- **Practical Skills:** Logistics, ShelterSupport, BasicRecordKeeping, UseOfBasicEquipment, NavigationAndOrientation, Driving, CrowdQueueManagement, PilotLicense, HGVCategoryD  
- **Technology:** BasicITSkills, ConfidentSmartphoneUse, FamiliarityWithRemoteCommunicationTools, SimpleDataEntryAndReporting, ResponsibleHandlingOfSocialMedia  
- **Local Knowledge:** KnowledgeOfLocalRoadsFacilitiesResources, UnderstandingDiverseNeedsWithinCommunity, AwarenessOfLocalSupportServices

**Requirements / Equipment & resources (by category):**

- **Physical & Personal:** PhysicalStamina, AbilityToWorkOutdoors, PersonalPreparedness  
- **Clothing:** SturdyFootwear, WaterproofsAndWarmLayers, Gloves, HighVisibilityVest  
- **Equipment:** HeadtorchOrFlashlight, PhoneAndPowerBank, SmallPersonalFirstAidKit, WaterBottle, WalkieTalkiesOrRadios, PortableGeneratorOrPowerStation, WaterPump, Tools, PortableShelterOrGazebo, ThermalBlankets, PPE, MapsOrWaterproofMapCases, LifeJacket  
- **Vehicles:** FourByFourVehicle, SUVOrOffRoadVehicle, VehicleWithTowCapability, AccessToVanOrPeopleCarrier, AbilityToTransportEquipmentOrSupplies, AccessToBicyclesOrCargoBikes, Boat, Hovercraft  
- **Facilities:** Venue, Kitchen


### Appendix B: Reference Links

- [Figma – PDS design, view credentials in Pod](https://www.figma.com/proto/eywFX889vpkbxAcq3REmZD/Personal-Data-Store--PDS--design-examples---template--Community-?node-id=10-14156&p=f&t=YLXOoNpaLBROXJxU-0&scaling=scale-down&content-scaling=fixed&page-id=1%3A5&starting-point-node-id=67%3A42597)  
- [govo.org – volunteer search interface](https://govo.org/)  
- Volunteering Data API: `https://api.volunteeringdata.io/`  
- Volunteer ontology: [`https://github.com/volunteeringdata/volunteering-open-data-infrastructure/blob/main/vocabulary/vocabulary.ttl`](https://github.com/volunteeringdata/volunteering-open-data-infrastructure/blob/main/vocabulary/vocabulary.ttl)  
- `First Protoype:`   
  - [`https://github.com/theodi/volunteer-profile-manager/`](https://github.com/theodi/volunteer-profile-manager/)  
  - [`https://volunteer-profile-manager.vercel.app/`](https://volunteer-profile-manager.vercel.app/)  
- [`Gov.uk`](http://Gov.uk) `platform: https://signin.account.gov.uk/enter-email-create`

### **Appendix C: Digital DBS Certificates and Credential Flow (Research and Spec)**

This appendix summarises how **digital DBS certificates** and UK government digital credentials work today, and specifies how the volunteer app can support viewing and sharing a valid DBS document.

#### **C.1 Current state: DBS and UK digital identity**

**DBS (Disclosure and Barring Service)**

* **Basic** (unspent convictions only): Applied for via GOV.UK ([Request a basic DBS check](https://www.gov.uk/request-copy-criminal-record)); identity proved with **GOV.UK One Login**; applicants can view and share results online when there are no convictions (processing typically \< 3 days).  
* **Standard / Enhanced / Enhanced with Barred Lists**: Applied for via Registered Bodies (RBs) or Responsible Organisations (ROs). Identity can be verified by certified Identity Service Providers (IDSPs) under the [UK Digital Identity and Attributes Trust Framework](https://www.gov.uk/government/collections/uk-digital-identity-and-attributes-trust-framework). DBS has published [digital identity verification guidance](https://www.gov.uk/government/publications/dbs-identity-checking-guidelines/dbs-digital-identity-verification-guidance) and [ID checking guidelines](https://www.gov.uk/government/publications/dbs-identity-checking-guidelines) (updated April 2025).  
* **Digital certificates**: DBS is developing digital certificates for Standard and Enhanced products (launch planned 2024–25 per DBS business plan). Today, certificate holders can track or view their certificate via the DBS online service (manage DBS check, OTP, security questions); the “shareable digital credential” path is aligning with **GOV.UK Wallet** (see below).

**E-bulk (DBS technical docs)**

* [E-bulk technical documents](https://www.gov.uk/government/publications/dbs-e-bulk-technical-documents) define the interface between **DBS and Registered Bodies** for submitting multiple applications and receiving results (business message spec, interface control document, connectivity and test plans).  
* E-bulk is not an API for certificate holders to obtain a digital certificate; it is for RBs to submit applications and receive disclosure results. Certificate-holder issuance (e.g. into a wallet) is separate.

#### **C.2 GOV.UK Wallet: specs and APIs for issuance and consumption**

**Issuance (government → user)**

* **Protocol:** [OpenID Connect for Verifiable Credential Issuance (OIDC4VCI)](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html).  
* **Credential formats:**  
  1. [W3C Verifiable Credential Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) (no selective disclosure in current Wallet support), or  
  2. [ISO/IEC 18013-5](https://www.iso.org/obp/ui/en/#iso:std:iso-iec:18013:-5:ed-1:v1:en) mdoc (e.g. digital driving licence).  
* **Prerequisites for issuers:** Onboard with [GOV.UK One Login](https://docs.sign-in.service.gov.uk/); obtain a unique **client identifier** and the **walletSubjectId** custom claim (pairwise identifier linking the user in the issuer service and in the Wallet).  
* **Flow (high level):**  
  1. User authenticates with GOV.UK One Login to the credential issuer service; issuer fetches walletSubjectId from One Login /userinfo.  
  2. Issuer generates a credential offer (QR code or deep link) containing credential configuration IDs, pre-authorised code, and issuer URL.  
  3. User opens GOV.UK Wallet; Wallet exchanges pre-authorised code with One Login for an **access token**.  
  4. Wallet calls issuer /.well-known/openid-credential-issuer (metadata), /.well-known/jwks.json (verify pre-auth code), then issuer /.well-known/did.json (DID document for signature verification).  
  5. Wallet generates **proof of possession** and sends POST to issuer /credential with access token and proof; issuer validates token and proof, binds credential to Wallet’s did:key, signs and returns credential.  
  6. Wallet stores credential. Optional: issuer can expose /notification for Wallet to notify success/failure.  
* **References:** [Issuing credentials to GOV.UK Wallet](https://docs.wallet.service.gov.uk/issuing-credentials-to-wallet.html), [Before you issue a credential](https://docs.wallet.service.gov.uk/before-integrating.html).

**Consumption (user → verifier)**

* **Protocols:** [OpenID for Verifiable Presentation (OID4VP)](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) for online sharing (mdoc and VC); [ISO/IEC 18013-5](https://www.iso.org/obp/ui/en/#iso:std:iso-iec:18013:-5:ed-1:v1:en) for **in-person** (proximity).  
* **Who can verify:** Government departments and certain public sector organisations can verify credentials directly. Outside government, only Digital Verification Services (DVS) that are certified against the trust framework and on the [digital identity and attribute services register](https://www.gov.uk/guidance/find-registered-digital-identity-and-attribute-services) can access and verify credentials from GOV.UK Wallet at the user’s request.  
* **Reference:** [Consuming and verifying credentials in GOV.UK Wallet](https://docs.wallet.service.gov.uk/consuming-and-verifying-credentials/).

#### **C.3 Trust framework and certification**

* **UK Digital Identity and Attributes Trust Framework** (DCMS): Rules and standards for secure, trustworthy identity and attribute checks. Certified IDSPs can perform **i**dentity verification for DBS applications; certified DVS providers can consume and verify credentials from GOV.UK Wallet.  
* **Certification:** [Digital identity certification for right to work, right to rent and criminal record checks](https://www.gov.uk/government/publications/digital-identity-certification-for-right-to-work-right-to-rent-and-criminal-record-checks/digital-identity-certification-for-right-to-work-right-to-rent-and-criminal-record-checks) (DCMS). For DBS, employers must use a certified IDSP for identity verification.  
* **List of certified services:** [List of certified digital identity and attribute services](https://www.gov.uk/government/publications/list-of-certified-digital-identity-and-attribute-services); [Digital Identity Services Register](https://www.digital-identity-services-register.service.gov.uk/).

#### **C.4 Specified flow for the volunteer application (DBS credential)**

**Assumptions**

* A valid DBS document may exist (a) as a credential in GOV.UK Wallet (once DBS/issues a digital certificate there), or (b) as a reference or copy in the user’s Solid Pod (e.g. a W3C VC or link to an authoritative result), or (c) in the short term only as a status (e.g. “I have a valid Basic/Standard/Enhanced DBS” with link to DBS view/track).  
* The volunteer app does not issue DBS credentials; issuance is by DBS (or a DBS-approved path) via GOV.UK One Login / GOV.UK Wallet or existing DBS online view.  
* **Verifiers** (e.g. VMS, voluntary organisation) that need to cryptographically verify a DBS credential must be either public sector or a certified DVS; the app may support “share” by directing the user to Wallet or by sending a presentation (e.g. OID4VP) if the credential is available in a format the app can present.

**Flow to implement**

1. **Credentials view (Pod)**  
   * **FR-2.1, FR-2.2:** Provide a page (PDS-style) that lists credentials stored in the user’s Pod.  
   * For each credential, show **type** (e.g. “DBS check – Basic/Standard/Enhanced”) and **summary** (e.g. issue date, level, “clear” or equivalent); allow “view details” where the data model allows.  
   * If the app supports references to credentials held elsewhere: e.g. “DBS certificate (view in GOV.UK Wallet)” with a deep link or button that opens the Wallet / DBS view flow.  
   * **Pod-stored credentials:** If the user has stored a W3C VC (or equivalent) in the Pod (e.g. in a dedicated container), the app reads it, validates structure/signature where possible, and displays it in the credentials view. Schema for “DBS-type” credential in Pod to be aligned with W3C VC 2.0 and any DBS/GOV.UK Wallet credential type when published.  
2. **Sharing a valid DBS document (FR-3.1)**  
   * **Option A – Credential in GOV.UK Wallet:** Show “Share DBS” (or “Show DBS to organisation”); guide the user to **open GOV.UK Wallet** and present the credential (in-person: proximity; online: OID4VP to a verifier). The app may deep-link to Wallet with a request to present the DBS credential; exact deep-link/API depends on Wallet’s public interface. Verifier must be certified DVS or public sector.  
   * **Option B – Credential in Pod:** If the credential is stored as a VC in the Pod, the app can generate a **verifiable presentation** (e.g. OID4VP) and send it to a verifier endpoint (e.g. VMS) when the user consents. Verifier still must validate the VC and issuer (DBS or delegated).  
   * **Option C – No digital credential yet:** Show “You can view your DBS status online” with link to [Track or view your DBS certificate](https://www.gov.uk/guidance/track-a-dbs-application); and/or “Add a link to your DBS certificate” (store a URL or reference in the Pod for the user’s own use). No cryptographic verification in-app.  
3. **Data model (Pod)**  
   * For credentials **stored in the Pod**, use a consistent container (e.g. {pod}/credentials/) and a shape/schema for “government or third-party credential” (type, issuer, issue date, expiry, summary fields, optional VC payload or reference). Align credential type for DBS with W3C VC 2.0 and, when available, GOV.UK Wallet / DBS credential type.  
   * For references only (credential held in Wallet or DBS online), store minimal metadata (type, label, external URL or Wallet deep-link) so the credentials view can list and open them.  
4. **Security and consent**  
   * Only list and display credentials the user is authorised to read from their Pod (Solid ACLs).  
   * Sharing always requires an explicit user action (e.g. “Share with this organisation”); no automatic sending to third parties.  
   * If the app triggers a redirect or deep link to GOV.UK Wallet, the user completes any consent in the Wallet flow.  
5. **Summary**  
   * **Issuance** of DBS credentials (handled by DBS / GOV.UK One Login / Wallet).  
   * **Verifier integration** (VMS or employer as verifier); the app enables the user to **present** or **point to** their DBS; the verifier’s side (DVS certification, OID4VP endpoint) is not built in this app.  
   * **E-bulk:** Not used for certificate-holder flows; relevant only for RBs submitting applications.

#### **C.5 Suggested DBS implementation flow**

This section outlines a concrete, phased way to integrate DBS into the volunteer app based on the research in C.1–C.4. The app never issues DBS credentials and never acts as a verifier; it helps volunteers discover, view, and share their DBS status or credential.

**Where DBS appears in the app**

* **Credentials page (primary):** A dedicated "Credentials" or "My credentials" page (PDS-style, per FR-2.1) lists all credentials the user has. DBS is one credential type. From here the user can view details, add a reference, or open an external flow (DBS track/view or GOV.UK Wallet).  
* **Optional entry points:** During profile setup or when applying to an opportunity that requires DBS, the app can show a short message: "Some roles need a DBS check. You can add or view your DBS in Credentials" with a link to the Credentials page.

**Phase 1: Credentials view and DBS reference (implement first)**

Goal: Users can see a Credentials page and record that they have a DBS (or link to view it), without the app handling issuance or cryptographic verification.

1. **Credentials page**  
   * Add a route, e.g. /credentials.  
   * List credentials from the Pod (see data model below). If the list is empty, show an empty state: "You don't have any credentials yet" and actions to add one (e.g. "I have a DBS check", "Add a link to a credential").  
2. **DBS as a reference (no VC yet)**  
   * **"I have a DBS check"** – User can add a **reference** stored in the Pod:  
     * Type: e.g. DBS or DBS-Basic / DBS-Standard / DBS-Enhanced.  
     * Optional: level (Basic/Standard/Enhanced), issue date, expiry if known, and/or a link (e.g. to [Track or view your DBS certificate](https://www.gov.uk/guidance/track-a-dbs-application) or a user-saved URL).  
   * Data is stored in the app's credential container in the Pod (e.g. {pod}/credentials/ or {pod}/volunteer/credentials/) using a simple shape: credential type, label, optional dates, optional externalUrl. No VC(Verifiable Credential) payload required in Phase 1\.  
   * **"I need to get a DBS check"** – Show a single call-to-action that links out to the official flow:  
     * Basic: [Request a basic DBS check](https://www.gov.uk/request-copy-criminal-record) (GOV.UK One Login).  
     * Standard/Enhanced: Link to [DBS checks](https://www.gov.uk/dbs-check-applicant-process) or guidance so the user can apply via their employer/Registered Body.  
   * **"View my DBS online"** – Button/link to [Track or view your DBS certificate](https://www.gov.uk/guidance/track-a-dbs-application). User leaves the app and signs in to the DBS service (OTP, security questions) to view the certificate there.  
3. **Share (Phase 1\)**  
   * No cryptographic share from the app. Options:  
     * **"Share with an organisation"** – Opens a short explanation: "To share your DBS you can (1) use the official DBS view service and share the certificate reference number, or (2) when available, use GOV.UK Wallet to present your digital DBS." Plus link to DBS track/view and (when applicable) GOV.UK Wallet.

**Phase 2: GOV.UK Wallet integration (when DBS issues to Wallet)**

Goal: When DBS (or a DBS-approved path) issues a digital certificate into GOV.UK Wallet, the volunteer app helps the user open the Wallet to view or share it.

1. **Credentials page**  
   * If the user has added a "DBS (in GOV.UK Wallet)" reference (or the app can detect Wallet availability), show a card: e.g. "DBS certificate – in GOV.UK Wallet" with actions:  
     * **View in Wallet** – Deep link to GOV.UK Wallet to view the DBS credential (exact URL/scheme to follow [GOV.UK Wallet documentation](https://docs.wallet.service.gov.uk/) when published for holders).  
     * **Share / Show to organisation** – Deep link or guidance to open Wallet and present the credential (OID4VP for online, or in-person proximity per ISO 18013-5). Verifiers must be certified DVS or public sector (see C.2).  
2. **No credential in Wallet yet**  
   * Keep Phase 1 behaviour: "Get a DBS check" and "View your DBS online" (DBS track/view) and optional reference stored in Pod.  
3. **Data model**  
   * Extend the credential reference in the Pod to allow source: "govuk-wallet" (or similar) and an optional Wallet deep-link or credential type id so the UI can show "View in Wallet" / "Share via Wallet".

**Phase 3 (optional): Verifiable credential in Pod**

Goal: If the user obtains a W3C VC (e.g. exported from Wallet or issued in a format storable in the Pod), the app can store and present it.

1. **Storage**  
   * Use a dedicated container, e.g. {pod}/credentials/. Store VC documents (e.g. JSON-LD or JWT VC) with a consistent naming or indexing resource so the Credentials page can list them.  
   * Validate structure (and signature if the app can verify the issuer's key) before displaying. Schema aligned with [W3C VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) and any DBS/GOV.UK Wallet credential type when published.  
2. **Credentials view**  
   * List Pod-stored VCs; for DBS-type credentials show type, issuer, issue date, and summary (e.g. level, "clear"). "View details" shows the payload in a clear, minimal layout (no raw JSON unless the user requests it).  
3. **Share**  
   * **"Share with organisation"** – When the user selects a Pod-stored DBS VC, the app generates a verifiable presentation (OID4VP profile as per [GOV.UK Wallet consuming credentials](https://docs.wallet.service.gov.uk/consuming-and-verifying-credentials/)) and sends it to a verifier endpoint (e.g. VMS or employer) that the user has chosen. The verifier must be certified DVS or public sector and must validate the VC and issuer (DBS or delegated). Implementation details (OID4VP client, endpoint discovery) to follow when the verifier side is defined.

**Data model (Pod) – summary**

| Aspect | Phase 1 | Phase 2 | Phase 3 |
| :---- | :---- | :---- | :---- |
| Container | {pod}/credentials/ (or {pod}/volunteer/credentials/) | Same | Same |
| DBS entry | Reference only: type, label, optional level, dates, externalUrl | Reference \+ optional source: govuk-wallet, deep-link | Optional: full VC document (JSON-LD/JWT) in container |
| Listing | Read container; show type \+ summary for each | Same; "View in Wallet" if source is Wallet | Same; show Pod-stored VCs with summary |
| Share | Outbound link \+ copy (no crypto) | Deep link to Wallet (user presents in Wallet) | App builds VP, POST to verifier (user consents) |

**User journeys (summary)**

1. **"I don't have a DBS"** → App links to GOV.UK Basic DBS or guidance for Standard/Enhanced. User completes flow outside the app. After receiving the certificate, user can add a reference (Phase 1\) or, when available, add "DBS in Wallet" (Phase 2\) or store a VC (Phase 3).  
2. **"I have a DBS and want to record it"** → User goes to Credentials → "I have a DBS check" → Choose level, optionally add link or date → Save reference in Pod (Phase 1). Later, "Add DBS from GOV.UK Wallet" if supported (Phase 2).  
3. **"I want to view my DBS"** → Credentials page → If reference only: "View online" → DBS track/view (external). If Wallet: "View in Wallet" (Phase 2). If VC in Pod: view details in app (Phase 3).  
4. **"I need to share my DBS with an organisation"** → Credentials → Select DBS → "Share" → Phase 1: explanation \+ link to DBS service / Wallet. Phase 2: open Wallet to present. Phase 3: choose verifier, consent, app sends VP.

**What the app does not do**

* **Issue** DBS credentials (DBS / GOV.UK One Login / Wallet only).  
* **Verify** credentials (only certified DVS or public sector verifiers do that).  
* **Call DBS e-bulk or any DBS API** (e-bulk is for Registered Bodies submitting applications, not for certificate holders).  
* **Store or handle** the user's GOV.UK One Login session; any Wallet or DBS view flow is in the browser or native Wallet app.

**Implementation checklist (Phase 1\)**

* \[ \] Add /credentials route and Credentials page (PDS-style layout).  
* \[ \] Define Pod shape for credential reference (type, label, optional level, dates, externalUrl); ensure only the volunteer's Pod is written to (Solid ACLs).  
* \[ \] Create container {pod}/credentials/ (or equivalent) when the user adds their first credential.  
* \[ \] UI: "I have a DBS check" form (level, optional date, optional URL) → write reference to Pod.  
* \[ \] UI: "I need to get a DBS check" → link to GOV.UK Basic and to DBS guidance for Standard/Enhanced.  
* \[ \] UI: "View my DBS online" → link to [Track or view your DBS certificate](https://www.gov.uk/guidance/track-a-dbs-application).  
* \[ \] UI: "Share" (Phase 1\) → short explanation and links (no crypto).  
* \[ \] List credentials from Pod on Credentials page; show DBS reference with type/summary and actions above.

#### **C.6 Reference links (DBS and digital credentials)**

* [DBS e-bulk technical documents](https://www.gov.uk/government/publications/dbs-e-bulk-technical-documents)  
* [DBS digital identity verification guidance](https://www.gov.uk/government/publications/dbs-identity-checking-guidelines/dbs-digital-identity-verification-guidance)  
* [DBS digital identity factsheet](https://www.gov.uk/government/publications/dbs-identity-checking-guidelines/dbs-digital-identity-factsheet)  
* [Digital identity certification (right to work, right to rent, criminal record)](https://www.gov.uk/government/publications/digital-identity-certification-for-right-to-work-right-to-rent-and-criminal-record-checks/digital-identity-certification-for-right-to-work-right-to-rent-and-criminal-record-checks)  
* [GOV.UK Wallet – Issuing credentials](https://docs.wallet.service.gov.uk/issuing-credentials-to-wallet.html)  
* [GOV.UK Wallet – Before you issue a credential](https://docs.wallet.service.gov.uk/before-integrating.html)  
* [GOV.UK Wallet – Consuming and verifying credentials](https://docs.wallet.service.gov.uk/consuming-and-verifying-credentials/)  
* [OIDC4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)  
* [W3C Verifiable Credential Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)  
* [Track or view your DBS certificate](https://www.gov.uk/guidance/track-a-dbs-application)

