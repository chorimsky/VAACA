import { TopRule } from "@/components/TopRule";

/** Route-transition placeholder: the brand rule plus a quiet progress bar. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas">
      <TopRule />
      <div
        role="status"
        aria-live="polite"
        className="mx-auto max-w-[1180px] px-8 py-16"
      >
        <span className="sr-only">Loading…</span>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
          <div className="vaaca-indeterminate h-full w-1/3 rounded-full bg-teal" />
        </div>
      </div>
    </div>
  );
}
