/** Shared surfaces for the two document-palette screens. */

export function DocCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[14px] border border-doc-line bg-white ${className}`}
    >
      {children}
    </div>
  );
}

/** Bordered, rounded table shell with the doc palette's header band. */
export function DocTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-doc-line bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-doc-line bg-doc-head px-4 py-3 text-left text-[12px] font-semibold text-navy"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SectionHeading({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className={`mb-3 text-[15px] font-bold text-navy ${className}`}>
      {children}
    </h2>
  );
}

/** The intro paragraph each Operating System tab opens with. */
export function TabIntro({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-[18px] max-w-[780px] text-[13.5px] leading-[1.6] text-doc-body">
      {children}
    </p>
  );
}
