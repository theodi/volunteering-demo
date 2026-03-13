import {
  TermWrapper,
  ValueMapping,
  TermMapping,
  ObjectMapping,
} from "rdfjs-wrapper";
import { FOAF, PIM, SOLID, VCARD, SCHEMA } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a vCard node that has vcard:value (e.g. email, telephone, url).
 * We use VCARD.value (...#value), not hasValue (...#hasValue), to match the W3C vCard ontology;
 */
class HasValue extends TermWrapper {
  /** Resolves vcard:value (literal or IRI like mailto:/tel:) from this node. */
  get value(): string {
    const literal = this.singularNullable(VCARD.value, ValueMapping.literalToString);
    if (literal != null) return literal;
    const iri = this.singularNullable(VCARD.value, ValueMapping.iriToString);
    if (iri != null) return iri;
    return this.term.value;
  }
}

class Address extends TermWrapper {
  get region(): string | null {
    return this.singularNullable(VCARD.region, ValueMapping.literalToString) ?? null;
  }
  get countryName(): string | null {
    return this.singularNullable(VCARD.countryName, ValueMapping.literalToString) ?? null;
  }
  get formatted(): string {
    const parts = [this.region, this.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "";
  }
}

export class Agent extends TermWrapper {
  get vcardFn(): string | undefined {
    return this.singularNullable(VCARD.fn, ValueMapping.literalToString);
  }

  get vcardHasUrl(): string | undefined {
    return this.singularNullable(VCARD.hasUrl, ValueMapping.iriToString);
  }

  get organization(): string | null {
    return (
      this.singularNullable(VCARD.organizationName, ValueMapping.literalToString) ??
      null
    );
  }

  get role(): string | null {
    return (
      this.singularNullable(VCARD.role, ValueMapping.literalToString) ?? null
    );
  }

  get title(): string | null {
    return this.singularNullable(VCARD.title, ValueMapping.literalToString) ?? null;
  }

  get phone(): string | null {
    const first = this.hasTelephone?.value ?? null;
    if (first != null) return first;
    const all = this.telephones;
    if (all.size === 0) return null;
    return [...all][0]?.value ?? null;
  }

  /** All telephone nodes (use .value on each for the number). */
  get telephones(): Set<HasValue> {
    return this.objects(VCARD.hasTelephone, ObjectMapping.as(HasValue), ObjectMapping.as(HasValue));
  }

  get hasTelephone(): HasValue | undefined {
    return this.singularNullable(VCARD.hasTelephone, ObjectMapping.as(HasValue));
  }

  get foafName(): string | undefined {
    return this.singularNullable(FOAF.fname, ValueMapping.literalToString);
  }

  get name(): string | null {
    return (
      this.vcardFn ??
      this.foafName ??
      this.term.value.split("/").pop()?.split("#")[0] ??
      null
    );
  }

  get storageUrls(): Set<string> {
    return new Set([...this.pimStorage, ...this.solidStorage]);
  }

  get foafHomepage(): string | undefined {
    return this.singularNullable(FOAF.homepage, ValueMapping.iriToString);
  }

  /** vcard:url can point to a node with vcard:value (e.g. WebID URL). */
  get hasUrlValue(): HasValue | undefined {
    return this.singularNullable(VCARD.hasUrl, ObjectMapping.as(HasValue));
  }

  get website(): string | null {
    return this.hasUrlValue?.value ?? this.vcardHasUrl ?? this.foafHomepage ?? null;
  }

  get photoUrl(): string | null {
    return (
      this.singularNullable(VCARD.hasPhoto, ValueMapping.iriToString) ??
      this.singularNullable(VCARD.hasPhoto, ValueMapping.literalToString) ??
      null
    );
  }

  get pimStorage(): Set<string> {
    return this.objects(PIM.storage, ValueMapping.iriToString, TermMapping.stringToIri);
  }

  get solidStorage(): Set<string> {
    return this.objects(SOLID.storage, ValueMapping.iriToString, TermMapping.stringToIri);
  }

  get email(): string | null {
    return this.hasEmail?.value ?? null;
  }

  get hasEmail(): HasValue | undefined {
    return this.singularNullable(VCARD.hasEmail, ObjectMapping.as(HasValue));
  }

  get knows(): Set<string> {
    return this.objects(FOAF.knows, ValueMapping.iriToString, TermMapping.stringToIri);
  }

  get bday(): string | null {
    return this.singularNullable(VCARD.bday, ValueMapping.literalToString) ?? null;
  }

  get note(): string | null {
    return this.singularNullable(VCARD.note, ValueMapping.literalToString) ?? null;
  }

  get hasAddress(): Address | undefined {
    return this.singularNullable(VCARD.hasAddress, ObjectMapping.as(Address));
  }

  get location(): string | null {
    const addr = this.hasAddress?.formatted;
    return (addr != null && addr !== "") ? addr : null;
  }

  get preferredSubjectPronoun(): string | null {
    return this.singularNullable(SOLID.preferredSubjectPronoun, ValueMapping.literalToString) ?? null;
  }

  /** schema:sameAs URLs (e.g. social profiles). */
  get sameAs(): Set<string> {
    return this.objects(SCHEMA.sameAs, ValueMapping.iriToString, TermMapping.stringToIri);
  }
}
