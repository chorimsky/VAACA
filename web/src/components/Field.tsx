/** Shared form chrome for the login and registration screens. */

const CONTROL =
  "rounded-lg border border-line px-3.5 py-3 text-[14px] focus:outline-2 focus:outline-offset-1 focus:outline-teal";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {hint ? (
        <span className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-navy">{label}</span>
          {hint}
        </span>
      ) : (
        <span className="text-[12.5px] font-semibold text-navy">{label}</span>
      )}
      {children}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`${CONTROL} bg-white ${props.className ?? ""}`}
    />
  );
}

/** Primary action. Disabled state matches the prototypes' grey fill. */
export function PrimaryButton({
  tone = "navy",
  className = "",
  ...props
}: React.ComponentProps<"button"> & { tone?: "navy" | "teal" }) {
  // White on brand teal is 2.94:1. `teal-deep` is the token for teal
  // carrying white text, and reaches 5.1:1.
  const enabled = tone === "teal" ? "bg-teal-deep" : "bg-navy";
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-lg border-none px-7 py-[13px] text-[14px] font-semibold disabled:cursor-not-allowed ${
        props.disabled
          ? // White on the old #B9C0C6 fill was 1.8:1 — unreadable even for a
            // disabled control. A tinted surface with muted ink reads as
            // inactive and stays legible.
            "bg-canvas-alt text-muted"
          : `text-white ${enabled}`
      } ${className}`}
    />
  );
}

export function SecondaryButton({
  className = "",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-lg border border-line bg-white px-6 py-[13px] text-[14px] font-semibold text-navy ${className}`}
    />
  );
}
