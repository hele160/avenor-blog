import Link from "next/link";

export interface AboutCardItemProps {
  type: "link" | "chip";
  label: string;
  href?: string;
  className?: string;
}

export function AboutCardItem({
  type,
  label,
  href,
  className = "",
}: AboutCardItemProps) {
  if (type === "link" && href) {
    return (
      <Link
        className={`about-card-item about-card-item--link ${className}`}
        href={href}
        target="_blank"
      >
        {label}
      </Link>
    );
  }

  return (
    <span className={`about-card-item about-card-item--chip ${className}`}>
      {label}
    </span>
  );
}
