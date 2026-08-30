import Link from "next/link";

export function HeartMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M16 27C12.3 23.7 5.5 19 5.5 13.1c0-3.4 2.6-5.7 5.8-5.7 1.8 0 3.6.9 4.7 2.3 1.2-1.4 2.9-2.3 4.8-2.3 3.1 0 5.7 2.3 5.7 5.7C26.5 19 19.7 23.7 16 27Z" />
        <path d="M10.4 12.9c.5-1.5 1.8-2.3 3.7-2.3" />
      </svg>
      {!compact && <span>Dearly</span>}
    </span>
  );
}

export function BrandLink({ className = "brand" }: { className?: string }) {
  return (
    <Link className={className} href="/" aria-label="Dearly home">
      <HeartMark />
    </Link>
  );
}

export function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className={diagonal ? "arrow arrow--diagonal" : "arrow"} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.5 10h13M12 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

