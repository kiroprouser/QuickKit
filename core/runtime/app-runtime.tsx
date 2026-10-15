/**
 * QuickKit persistent root AppRuntime.
 *
 * This client component lives in app/layout.tsx so it initializes exactly ONCE
 * and persists across Next client navigation. Page components CONSUME these
 * systems; they do NOT initialize duplicate instances.
 *
 *     AppRuntime
 *       ├── RuntimeEffects (route tracking, theme, SW, shortcut)
 *       ├── Header
 *       ├── BackBreadcrumb (global Back + breadcrumb row — non-Home only)
 *       ├── GlobalQuickCommand (the dialog/sheet itself)
 *       ├── CommandFab (floating Quick Command entry — bottom-right)
 *       ├── Toaster
 *       ├── <main>{children}</main>
 *       └── Footer
 *
 * The stores (PersistentAppStore + SessionStore) are zustand hooks — they do
 * not need explicit provider components.
 *
 * These systems must NOT reinitialize on normal internal navigation:
 * - persistent app state (PersistentAppStore)
 * - session/tool state (SessionStore)
 * - theme runtime (RuntimeEffects)
 * - recent-tool route tracking (RuntimeEffects)
 * - Quick Command state (SessionStore.cmdOpen/cmdQuery)
 * - Command shortcut (RuntimeEffects: Ctrl/⌘+K)
 * - global dialogs (QuickCommandDialog)
 * - toasts (Toaster)
 * - capability detection (capabilities module)
 * - service-worker registration (RuntimeEffects)
 */

"use client";

import type { ReactNode } from "react";
import { RuntimeEffects } from "@core/runtime/runtime-effects";
import { Header } from "@components/shell/header";
import { BackBreadcrumb } from "@components/shell/back-breadcrumb";
import { Footer } from "@components/shell/footer";
import { QuickCommandDialog } from "@components/command/quick-command-dialog";
import { CommandFab } from "@components/command/command-fab";
import { Toaster } from "@components/ui/toaster";

export function AppRuntime({ children }: { children: ReactNode }) {
  return (
    <>
      <RuntimeEffects />
      <Header />
      <BackBreadcrumb />
      <QuickCommandDialog />
      <CommandFab />
      <Toaster />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
