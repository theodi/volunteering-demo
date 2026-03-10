import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ExpandableText } from "./ExpandableText";

const fullBio =
  "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support and flight operations. Passionate about precision engineering, innovation and driving results in demanding environments.";

const truncatedBio =
  "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support and flight operations. Passionate about precision engineering, innovation";

export function Bio() {
  return (
    <Card>
      <SectionTitle>Bio</SectionTitle>
      <ExpandableText
        truncated={`${truncatedBio}...`}
        full={fullBio}
        className="text-sm leading-relaxed text-tranquil-black"
      />
    </Card>
  );
}
