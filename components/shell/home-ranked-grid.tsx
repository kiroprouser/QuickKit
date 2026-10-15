"use client";

import { useEffect, useState } from "react";
import { ToolCard } from "@components/ui/tool-card";
import { rankTools } from "@core/catalog/ranking";
import { allTools } from "@core/catalog/tools";
import { usePersistentStore } from "@core/runtime/persistent-store";

/**
 * Home unified ranked tool grid (client island).
 *
 * Renders canonical catalog order on server + first client render (no
 * hydration mismatch), then after mount swaps to the personalized ranked
 * order (favorites → recent non-favorites → remaining canonical).
 *
 * No separate All/Favorites/Recent sections. ONE unified collection.
 *
 * The static identity, Quick Command explainer, and privacy context for Home
 * are owned by app/page.tsx (Server Component) — this client island is ONLY
 * the ranked grid.
 */

export function HomeRankedGrid() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const favorites = usePersistentStore((s) => s.favorites);
  const recent = usePersistentStore((s) => s.recent);

  // Canonical order (server + first client render).
  // After mount, switch to ranked order (favorites → recent → remaining).
  const tools = mounted ? rankTools(favorites, recent) : allTools();

  return (
    <ul className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((t) => (
        <li key={t.id}>
          <ToolCard tool={t} />
        </li>
      ))}
    </ul>
  );
}
