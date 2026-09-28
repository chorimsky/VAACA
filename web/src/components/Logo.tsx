import Link from "next/link";
import { routes } from "@/lib/routes";

/** The radiating-node mark, redrawn from the prototype SVG. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle
        cx="20"
        cy="20"
        r="18.5"
        stroke="#B5730C"
        strokeWidth="1"
        opacity="0.4"
      />
      <line x1="20" y1="20" x2="8" y2="8" stroke="#1AA6B3" strokeWidth="1.6" />
      <line x1="20" y1="20" x2="32" y2="8" stroke="#1AA6B3" strokeWidth="1.6" />
      <line x1="20" y1="20" x2="8" y2="32" stroke="#1AA6B3" strokeWidth="1.6" />
      <line
        x1="20"
        y1="20"
        x2="32"
        y2="32"
        stroke="#1AA6B3"
        strokeWidth="1.6"
      />
      <circle cx="20" cy="20" r="5.5" fill="#0E2A44" />
      <circle cx="8" cy="8" r="3" fill="#B5730C" />
      <circle cx="32" cy="8" r="3" fill="#1AA6B3" />
      <circle cx="8" cy="32" r="3" fill="#1AA6B3" />
      <circle cx="32" cy="32" r="3" fill="#B5730C" />
    </svg>
  );
}

/** Mark plus the two-line wordmark, linking home. */
export function Logo() {
  return (
    <Link href={routes.home} className="flex items-center gap-3 no-underline">
      <LogoMark />
      <div className="leading-[1.2]">
        <b className="text-[16px] tracking-[0.01em] text-navy">VAACA</b>
        <div className="text-[10.5px] tracking-[0.02em] text-muted">
          Virtual Assets Association of Central Africa
        </div>
      </div>
    </Link>
  );
}
