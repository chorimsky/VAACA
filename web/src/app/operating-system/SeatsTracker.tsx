"use client";

import { useState } from "react";

import { Tag } from "@/components/Tag";
import {
  SEAT_STATUSES,
  SEAT_STATUS_LABEL,
  type SeatStatus,
  type StaffSeat,
} from "@/lib/seat-types";

/**
 * Recruitment tracker for the nine Coordination Council seats.
 *
 * The table this replaces printed "Vacant — recruiting" on every row from a
 * constant, so the tracker could not track anything. Changes are saved against
 * the acting account, and a filled seat must record who holds it and what they
 * represent before it will save.
 */

const INPUT =
  "w-full rounded-lg border border-doc-line bg-white px-3 py-2 text-[13px] text-doc-ink focus:outline-2 focus:outline-offset-1 focus:outline-teal-ink";

export function SeatsTracker({ seats: initial }: { seats: StaffSeat[] }) {
  const [seats, setSeats] = useState(initial);
  const [openN, setOpenN] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = seats.find((s) => s.n === openN) ?? null;
  const [draft, setDraft] = useState({
    holder: "",
    organisation: "",
    note: "",
  });

  // Reload the editor when a different seat is opened — adjusted during render
  // rather than in an effect.
  const key = open
    ? `${open.n}:${open.holder ?? ""}:${open.organisation ?? ""}:${open.note ?? ""}`
    : "";
  const [draftKey, setDraftKey] = useState("");
  if (draftKey !== key) {
    setDraftKey(key);
    setDraft({
      holder: open?.holder ?? "",
      organisation: open?.organisation ?? "",
      note: open?.note ?? "",
    });
  }

  const patch = async (n: number, body: Record<string, unknown>) => {
    setPending(n);
    setError(null);
    try {
      const res = await fetch(`/api/seats/${n}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That change could not be saved.");
        return;
      }
      const { seat } = (await res.json()) as { seat: StaffSeat };
      setSeats((prev) => prev.map((s) => (s.n === seat.n ? seat : s)));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  };

  const filled = seats.filter((s) => s.status === "filled").length;

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red bg-tint-red px-4 py-2.5 text-[13px] text-red"
        >
          {error}
        </p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {seats.map((seat) => {
          const busy = pending === seat.n;
          const isOpen = openN === seat.n;
          return (
            <li
              key={seat.n}
              className="rounded-2xl border border-doc-line bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] tracking-[0.12em] text-doc-muted uppercase">
                    Seat {seat.n} · {seat.blocLabel}
                  </div>
                  <div className="mt-0.5 text-[14.5px] font-bold text-navy">
                    {seat.name}
                  </div>
                  <div className="mt-1 text-[12.5px] text-doc-body">
                    {seat.why}
                  </div>
                  {seat.holder || seat.organisation ? (
                    <div className="mt-1.5 text-[12.5px] font-semibold text-teal-ink">
                      {[seat.holder, seat.organisation]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                  {seat.note ? (
                    <div className="mt-1 text-[12px] text-doc-muted italic">
                      {seat.note}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Tag tone={seat.tone}>{seat.statusLabel}</Tag>
                  <label>
                    <span className="sr-only">Status for seat {seat.n}</span>
                    <select
                      className={INPUT}
                      value={seat.status}
                      disabled={busy}
                      onChange={(e) =>
                        patch(seat.n, {
                          status: e.target.value as SeatStatus,
                        })
                      }
                    >
                      {SEAT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {SEAT_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenN(isOpen ? null : seat.n)}
                    className="cursor-pointer rounded-lg border border-doc-line bg-white px-3 py-2 text-[12.5px] font-semibold text-navy"
                  >
                    {isOpen ? "Close" : "Record holder"}
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="mt-3.5 grid gap-3 border-t border-doc-line pt-3.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12.5px] font-semibold text-doc-ink">
                      Holder
                    </span>
                    <input
                      className={INPUT}
                      maxLength={120}
                      value={draft.holder}
                      onChange={(e) =>
                        setDraft({ ...draft, holder: e.target.value })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12.5px] font-semibold text-doc-ink">
                      Organisation
                    </span>
                    <input
                      className={INPUT}
                      maxLength={160}
                      value={draft.organisation}
                      onChange={(e) =>
                        setDraft({ ...draft, organisation: e.target.value })
                      }
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[12.5px] font-semibold text-doc-ink">
                      Sourcing / conflict note
                    </span>
                    <textarea
                      rows={2}
                      maxLength={400}
                      className={INPUT}
                      value={draft.note}
                      onChange={(e) =>
                        setDraft({ ...draft, note: e.target.value })
                      }
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        patch(seat.n, {
                          holder: draft.holder.trim() || null,
                          organisation: draft.organisation.trim() || null,
                          note: draft.note.trim() || null,
                        })
                      }
                      className="cursor-pointer rounded-lg border-none bg-navy px-4 py-2 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-canvas-alt disabled:text-muted"
                    >
                      Save
                    </button>
                    <span className="ml-3 text-[12px] text-doc-muted">
                      Only the organisation of a filled seat is published.
                    </span>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[12.5px] text-doc-muted">
        {filled} of {seats.length} seats filled.
      </p>
    </>
  );
}
