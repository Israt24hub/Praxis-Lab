"use client";

import { useCallback, useEffect, useState } from "react";

import { DIGITS_CREDIT, type Digits, loadDigits } from "@/lib/digits";

/*
 * Loads the 8×8 digits for a lab (one file, fetched once per page and shared between labs),
 * and the small notices every digits lab shows while loading, on failure and as credit.
 */
export function useDigits() {
  const [data, setData] = useState<Digits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    loadDigits()
      .then((d) => live && setData(d))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : "Could not load the digits"));
    return () => {
      live = false;
    };
  }, [attempt]);
  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);
  return { data, error, retry };
}

export function DigitsStatus({ error, retry }: { error: string | null; retry: () => void }) {
  return (
    <div role="status" className="rounded-panel border border-line bg-surface p-5 text-sm">
      {error ? (
        <p>
          {error}.{" "}
          <button type="button" onClick={retry} className="font-semibold text-primary underline underline-offset-2">
            Try again
          </button>
        </p>
      ) : (
        <p className="text-fg-muted">Loading 1,797 handwritten digits…</p>
      )}
    </div>
  );
}

export function DigitsCredit({ extra }: { extra?: string }) {
  return (
    <p className="text-sm text-fg-faint">
      Digits: {DIGITS_CREDIT}. {extra}
    </p>
  );
}
