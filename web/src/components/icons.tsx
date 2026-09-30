/**
 * The icon set.
 *
 * Every icon is drawn on the same grid so they read as one family:
 *
 *   - 24×24 viewBox, stroked (not filled), 1.5 units
 *   - round caps and joins
 *   - `currentColor` throughout, so an icon inherits its context and follows
 *     hover, focus and disabled states instead of being pinned to a hex value
 *   - `aria-hidden` by default; pass a `title` only when the icon is the sole
 *     carrier of meaning, which on this site it never is — every icon sits
 *     beside its own label
 *
 * Sizes come from `ICON_SIZE` rather than arbitrary numbers.
 */

export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export type IconSize = keyof typeof ICON_SIZE;

type IconProps = {
  size?: IconSize | number;
  className?: string;
  /** Supply only when the icon carries meaning no adjacent text does. */
  title?: string;
  /** Override the 1.5 default for a heavier or lighter reading. */
  strokeWidth?: number;
};

function Icon({
  size = "md",
  className = "",
  title,
  strokeWidth = 1.5,
  children,
}: IconProps & { children: React.ReactNode }) {
  const px = typeof size === "number" ? size : ICON_SIZE[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation & chrome                                                         */
/* -------------------------------------------------------------------------- */

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Icon>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H5M11 18l-6-6 6-6" />
  </Icon>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

/** Replaces the 🔒 emoji, which rendered differently on every platform. */
export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M4.5 12.5 9 17 19.5 6.5" />
  </Icon>
);

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 22 20H2L12 3.5Z" />
    <path d="M12 10v4M12 17h.01" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

export const DocumentIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    <path d="M14 2v6h6" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v12M7 11l5 5 5-5" />
    <path d="M4 20h16" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/* The three institutional pillars                                             */
/* -------------------------------------------------------------------------- */

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6l-8-3Z" />
  </Icon>
);

export const StandardsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9h10M7 13h10M7 17h6" />
  </Icon>
);

export const NetworkIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="4" cy="5" r="2" />
    <circle cx="20" cy="5" r="2" />
    <circle cx="4" cy="19" r="2" />
    <circle cx="20" cy="19" r="2" />
    <path d="M6.5 6.2 9.8 10M17.5 6.2 14.2 10M6.5 17.8 9.8 14M17.5 17.8 14.2 14" />
  </Icon>
);
