/**
 * Extended Agent — adds project-specific properties on top of @solid/object's Agent.
 *
 * The base Agent from @solid/object already provides:
 *   vcardFn, foafName, name, email, hasEmail, phone, hasTelephone,
 *   organization, role, title, website, vcardHasUrl, foafHomepage,
 *   photoUrl, storageUrls, pimStorage, solidStorage, oidcIssuer, knows
 *
 * We extend only for properties not yet in the shared library.
 */

import { Agent as BaseAgent } from "@solid/object";
import {
  TermWrapper,
  LiteralAs,
  NamedNodeAs,
  NamedNodeFrom,
  TermAs,
} from "@rdfjs/wrapper";
import { VCARD, SOLID, SCHEMA } from "@/app/lib/class/Vocabulary";

// ---------------------------------------------------------------------------
// Helper wrappers for structured vCard nodes
// ---------------------------------------------------------------------------

class Address extends TermWrapper {
  get region(): string | null {
    return this.singularNullable(VCARD.region, LiteralAs.string) ?? null;
  }
  get countryName(): string | null {
    return this.singularNullable(VCARD.countryName, LiteralAs.string) ?? null;
  }
  get formatted(): string {
    const parts = [this.region, this.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "";
  }
}

// ---------------------------------------------------------------------------
// Extended Agent
// ---------------------------------------------------------------------------

export class Agent extends BaseAgent {
  get bday(): string | null {
    return this.singularNullable(VCARD.bday, LiteralAs.string) ?? null;
  }

  get note(): string | null {
    return this.singularNullable(VCARD.note, LiteralAs.string) ?? null;
  }

  get hasAddress(): Address | undefined {
    return this.singularNullable(VCARD.hasAddress, TermAs.instance(Address));
  }

  get location(): string | null {
    const addr = this.hasAddress?.formatted;
    return addr != null && addr !== "" ? addr : null;
  }

  get preferredSubjectPronoun(): string | null {
    return this.singularNullable(SOLID.preferredSubjectPronoun, LiteralAs.string) ?? null;
  }

  /** schema:sameAs URLs (e.g. social profiles). */
  get sameAs(): Set<string> {
    return this.objects(SCHEMA.sameAs, NamedNodeAs.string, NamedNodeFrom.string);
  }
}
