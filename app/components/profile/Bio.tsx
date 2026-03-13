import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ExpandableText } from "./ExpandableText";
import { EmptyState } from "./EmptyState";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const TRUNCATE_LEN = 180;

export function Bio({ bio }: { bio?: string | null }) {
  const text = bio?.trim() || "";
  const hasBio = text.length > 0;
  const full = text;
  const truncated =
    text.length <= TRUNCATE_LEN ? text : `${text.slice(0, TRUNCATE_LEN)}...`;

  return (
    <Card>
      <SectionTitle>Bio</SectionTitle>
      {hasBio ? (
        <ExpandableText
          truncated={truncated}
          full={full}
          className="text-sm leading-relaxed text-tranquil-black"
        />
      ) : (
        <EmptyState
          title="No bio yet"
          description="Add a short bio to introduce yourself."
          icon={<DocumentTextIcon className="h-5 w-5" />}
          className="border-none"
        />
      )}
    </Card>
  );
}
