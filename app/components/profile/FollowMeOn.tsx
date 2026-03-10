import Image from "next/image";
import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";

const socialLinks = [
  { name: "Facebook", href: "#", src: "/facebook.svg", label: "Facebook" },
  { name: "Instagram", href: "#", src: "/instagram.svg", label: "Instagram" },
  { name: "X", href: "#", src: "/x.png", label: "X" },
  { name: "Snapchat", href: "#", src: "/snapchat.svg", label: "Snapchat" },
];

export function FollowMeOn({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <SectionTitle>Follow me on</SectionTitle>
      <div className="flex flex-wrap gap-3">
        {socialLinks.map(({ name, href, src, label }) => (
          <Link
            key={name}
            href={href}
            aria-label={label}
            className="flex h-10 w-10 shrink-0 items-center justify-center"
          >
            <Image
              src={src}
              alt=""
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
