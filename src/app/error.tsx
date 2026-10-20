"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Phase 1 has no error-reporting service; log for local debugging.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 sm:py-32">
      <p className="text-danger">Something went wrong</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">This page couldn’t be displayed.</h1>
      <p className="mt-4 max-w-prose text-lg text-fg-muted">
        Try loading it again. If it keeps failing, go back to the home page; the rest of the site should still work.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonStyles("primary")}>
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
        <Link href="/" className={buttonStyles("secondary")}>
          Go to home
        </Link>
      </div>
    </Container>
  );
}
