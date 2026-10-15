"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console — for developer visibility only.
    // The console has no unexplained errors in the production app under
    // normal use; this logger only fires when the error boundary catches.
    console.error("QuickKit error boundary:", error);
  }, [error]);

  return (
    <div className="qk-container py-16 sm:py-24 text-center">
      <p className="text-6xl sm:text-8xl font-bold text-[var(--color-primary)] tracking-tight">
        !
      </p>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-[var(--color-fg)]">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)] max-w-md mx-auto">
        An unexpected error occurred. Try again, or head back to Home. If the issue persists, please report it on the QuickKit GitHub repository.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-accent)] qk-focus-ring"
        >
          <RotateCcw size={16} aria-hidden /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] qk-focus-ring"
        >
          <Home size={16} aria-hidden /> Home
        </Link>
      </div>
    </div>
  );
}
