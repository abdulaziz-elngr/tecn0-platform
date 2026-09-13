"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side detail (message/stack) stays in the server/browser
    // console for diagnostics; the digest is the only thing shown to the
    // visitor, and it identifies nothing about the internal error.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Something went wrong</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">We hit a snag</h1>
      <p className="mt-3 text-[var(--slate)]">
        An unexpected error occurred. Try again, or head back to the homepage.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-[var(--slate)]">Reference: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--gold)] px-6 text-sm font-medium text-[var(--ink)] hover:bg-[var(--gold-deep)]"
      >
        Try again
      </button>
    </main>
  );
}
