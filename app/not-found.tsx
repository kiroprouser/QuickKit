import Link from "next/link";
import { Home, Search } from "lucide-react";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="qk-container py-16 sm:py-24 text-center">
      <p className="text-6xl sm:text-8xl font-bold text-[var(--color-primary)] tracking-tight">404</p>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-[var(--color-fg)]">
        That page got lost in transit
      </h1>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)] max-w-md mx-auto">
        The page you're looking for doesn't exist — or it never did. Head back to Home or jump straight to a tool.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-accent)] qk-focus-ring"
        >
          <Home size={16} aria-hidden /> Home
        </Link>
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] qk-focus-ring"
        >
          <Search size={16} aria-hidden /> Guide
        </Link>
      </div>
    </div>
  );
}
