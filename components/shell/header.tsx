"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@components/ui/cn";
import { AppLink } from "./app-link";
import { IconButton } from "@components/ui/icon-button";
import { NavigationProgress } from "./navigation-progress";
import { allTools } from "@core/catalog/tools";
import { footerPages } from "@core/catalog/pages";
import { haptic } from "@core/platform/haptics";

/**
 * QuickKit responsive persistent Header.
 *
 * ONE coherent header. Desktop:
 *   QuickKit | Tools | Guide | About | ... | Settings
 *
 * Mobile:
 *   QuickKit | Menu
 *
 * The Tools dropdown uses the canonical tool catalog in stable canonical
 * catalog order (NOT personalized). Personalized ranking exists only on Home.
 *
 * Quick Command is NOT in the header — it is exposed globally via the
 * <CommandFab /> floating action button (see <AppRuntime />).
 */

function BrandMark() {
  return (
    <AppLink
      href="/"
      aria-label="QuickKit home"
      className="flex items-center gap-2 qk-focus-ring rounded-md pr-2"
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold text-sm shadow-sm"
      >
        Q
      </span>
      <span className="font-semibold text-[var(--color-fg)] tracking-tight">QuickKit</span>
    </AppLink>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center h-10 px-3 rounded-md text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors qk-focus-ring"
      >
        Tools
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Tools"
          className="absolute left-0 top-full mt-1 w-64 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg p-1.5 z-50 qk-fade-in"
        >
          {allTools().map((t) => {
            const Icon = t.icon;
            return (
              <AppLink
                key={t.id}
                href={t.route}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Icon size={16} className="text-[var(--color-primary)]" aria-hidden />
                <span>{t.name}</span>
              </AppLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <IconButton
        label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        ref={btnRef as any}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </IconButton>
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-md qk-fade-in"
        >
          <div className="qk-container py-3 flex flex-col gap-1">
            <div className="px-2 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)] py-1">
              Tools
            </div>
            <div className="grid grid-cols-2 gap-1">
              {allTools().map((t) => {
                const Icon = t.icon;
                return (
                  <AppLink
                    key={t.id}
                    href={t.route}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
                  >
                    <Icon size={16} className="text-[var(--color-primary)]" aria-hidden />
                    <span>{t.shortName}</span>
                  </AppLink>
                );
              })}
            </div>
            <div className="h-px bg-[var(--color-border)] my-2" />
            {footerPages().map((p) => (
              <AppLink
                key={p.id}
                href={p.route}
                onClick={() => setOpen(false)}
                className="rounded-md px-2.5 py-2 text-sm text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
              >
                {p.name}
              </AppLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function Header() {
  return (
    <header
      // relative + overflow-visible so the NavigationProgress bar can be
      // positioned absolutely at the exact bottom edge of the Header.
      // The bar overlays the Header's bottom border temporarily; it does NOT
      // add height or shift content.
      className="relative sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur-md border-b border-[var(--color-border)]"
      style={{ minHeight: "var(--header-h)" }}
    >
      <div className="qk-container h-[var(--header-h)] flex items-center gap-1 sm:gap-2">
        <BrandMark />
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 ml-2">
          <ToolsMenu />
          <AppLink
            href="/guide"
            className="inline-flex items-center h-10 px-3 rounded-md text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors qk-focus-ring"
          >
            Guide
          </AppLink>
          <AppLink
            href="/about"
            className="inline-flex items-center h-10 px-3 rounded-md text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors qk-focus-ring"
          >
            About
          </AppLink>
        </nav>
        <div className="flex-1" />
        <AppLink
          href="/settings"
          className="hidden md:inline-flex items-center h-10 px-3 rounded-md text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors qk-focus-ring"
        >
          Settings
        </AppLink>
        <div className="md:hidden">
          <MobileMenuButton />
        </div>
      </div>
      {/* Navigation progress bar — positioned at the exact bottom edge.
          No track, no height, no CLS. Overlays the border temporarily. */}
      <NavigationProgress />
    </header>
  );
}
