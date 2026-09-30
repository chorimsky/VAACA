/**
 * The brand hairline that opens every page.
 *
 * Its own module rather than living in `Shell`: the error boundaries are
 * client components, and importing it from `Shell` would pull that file's
 * server-only translation lookup into the browser bundle.
 */
export function TopRule() {
  return (
    <div className="h-[3px] bg-[linear-gradient(90deg,#0B4944,#CAA228,#CAA228)]" />
  );
}
