import {
  TermWrapper,
  LiteralAs,
  NamedNodeAs,
  NamedNodeFrom,
  TermAs,
  TermFrom,
} from "@rdfjs/wrapper";
import { FOAF, PIM, SOLID, VCARD, SCHEMA } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a vCard node that has vcard:value (e.g. email, telephone, url).
 * We use VCARD.value (...#value), not hasValue (...#hasValue), to match the W3C vCard ontology.
 * Renamed to actualValue because TermWrapper now exposes `value` directly.
 */
class HasValue extends TermWrapper {
  get actualValue(): string {
    return this.singularNullable(VCARD.value, LiteralAs.string) ?? this.value;
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

export class Agent extends TermWrapper {
  get vcardFn(): string | undefined {
    return this.singularNullable(VCARD.fn, LiteralAs.string);
  }

  get vcardHasUrl(): string | undefined {
    return this.singularNullable(VCARD.hasUrl, NamedNodeAs.string);
  }

  get organization(): string | null {
    return (
      this.singularNullable(VCARD.organizationName, LiteralAs.string) ??
      null
    );
  }

  get role(): string | null {
    return (
      this.singularNullable(VCARD.role, LiteralAs.string) ?? null
    );
  }

  get title(): string | null {
    return this.singularNullable(VCARD.title, LiteralAs.string) ?? null;
  }

  get phone(): string | null {
    const first = this.hasTelephone?.actualValue ?? null;
    if (first != null) return first;
    const all = this.telephones;
    if (all.size === 0) return null;
    return [...all][0]?.actualValue ?? null;
  }

  /** All telephone nodes (use .actualValue on each for the number). */
  get telephones(): Set<HasValue> {
    return this.objects(VCARD.hasTelephone, TermAs.instance(HasValue), TermFrom.instance);
  }

  get hasTelephone(): HasValue | undefined {
    return this.singularNullable(VCARD.hasTelephone, TermAs.instance(HasValue));
  }

  get foafName(): string | undefined {
    return this.singularNullable(FOAF.fname, LiteralAs.string);
  }

  get name(): string | null {
    return (
      this.vcardFn ??
      this.foafName ??
      this.value.split("/").pop()?.split("#")[0] ??
      null
    );
  }

  get storageUrls(): Set<string> {
    return new Set([...this.pimStorage, ...this.solidStorage]);
  }

  get foafHomepage(): string | undefined {
    return this.singularNullable(FOAF.homepage, NamedNodeAs.string);
  }

  /** vcard:url can point to a node with vcard:value (e.g. WebID URL). */
  get hasUrlValue(): HasValue | undefined {
    return this.singularNullable(VCARD.hasUrl, TermAs.instance(HasValue));
  }

  get website(): string | null {
    return this.hasUrlValue?.actualValue ?? this.vcardHasUrl ?? this.foafHomepage ?? null;
  }

  get photoUrl(): string | null {
    return this.singularNullable(VCARD.hasPhoto, LiteralAs.string) ?? null;
  }

  get pimStorage(): Set<string> {
    return this.objects(PIM.storage, NamedNodeAs.string, NamedNodeFrom.string);
  }

  get solidStorage(): Set<string> {
    return this.objects(SOLID.storage, NamedNodeAs.string, NamedNodeFrom.string);
  }

  get email(): string | null {
    return this.hasEmail?.actualValue ?? null;
  }

  get hasEmail(): HasValue | undefined {
    return this.singularNullable(VCARD.hasEmail, TermAs.instance(HasValue));
  }

  get knows(): Set<string> {
    return this.objects(FOAF.knows, NamedNodeAs.string, NamedNodeFrom.string);
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
    return (addr != null && addr !== "") ? addr : null;
  }

  get preferredSubjectPronoun(): string | null {
    return this.singularNullable(SOLID.preferredSubjectPronoun, LiteralAs.string) ?? null;
  }

  /** schema:sameAs URLs (e.g. social profiles). */
  get sameAs(): Set<string> {
    return this.objects(SCHEMA.sameAs, NamedNodeAs.string, NamedNodeFrom.string);
  }
}
