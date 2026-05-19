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

/**
 * Workaround for a bug in @solid/object@0.5.0's internal HasValue class.
 *
 * The library's HasValue overrides the `.value` getter (which is part of the
 * RDF/JS Term interface). When N3's `termToId()` calls `.value` on a HasValue
 * instance during `store.match()`, it triggers the custom getter, which calls
 * `singularNullable` → `match(this, ...)` → `termToId(this)` → `.value` again,
 * causing infinite recursion (Maximum call stack size exceeded) - this breaks the App.
 *
 * This class does the same job (resolving the actual value from a vCard email/phone
 * node) but exposes it as `.hasValue` instead of overriding `.value`, so N3 can
 * still call `.value` safely to get the node's IRI.
 *
 * It also tries both vcard:value and vcard:hasValue because some Solid Pods
 * (e.g. solidcommunity.net) use vcard:value while the library expects vcard:hasValue.
 */
class VCardValueNode extends TermWrapper {
  get hasValue(): string | null {
    return this.singularNullable(VCARD.value, NamedNodeAs.string)
      ?? this.singularNullable(VCARD.hasValue, NamedNodeAs.string)
      ?? null;
  }
}

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
  /**
   * Override email to avoid @solid/object's HasValue class which has a
   * .value getter that conflicts with N3's termToId (causes infinite recursion).
   * We resolve vcard:hasEmail → vcard:hasValue manually.
   */
  get email(): string | null {
    const emailNode = this.singularNullable(VCARD.hasEmail, TermAs.instance(VCardValueNode));
    if (!emailNode) return null;
    return emailNode.hasValue;
  }

  /**
   * Override phone for the same reason as email above.
   */
  get phone(): string | null {
    const telNode = this.singularNullable(VCARD.hasTelephone, TermAs.instance(VCardValueNode));
    if (!telNode) return null;
    return telNode.hasValue;
  }

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
