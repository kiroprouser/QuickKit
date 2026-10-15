/**
 * QuickKit Home ranking — single source of truth for the unified Home collection.
 *
 * Ordering (deterministic tuple ordering — no frequency learning, no AI, no
 * decay algorithms):
 *
 *   1. favorite tools
 *   2. recent non-favorite tools (by MRU position)
 *   3. every remaining tool in stable canonical catalog order
 *
 * A tool that is both favorite and recent appears ONCE; favorite priority wins.
 * No duplicates. No separate All/Favorites/Recent sections — Home renders this
 * ranked list as one unified collection.
 */

import { allTools, type ToolCatalogEntry, type ToolId } from "./tools";

function rankKey(
  id: ToolId,
  favorites: ReadonlySet<ToolId>,
  recent: readonly ToolId[]
): readonly [number, number, number] {
  // 0 = favorite (first), 1 = recent non-favorite, 2 = remaining
  const bucket = favorites.has(id) ? 0 : recent.indexOf(id) >= 0 ? 1 : 2;
  // Within recent non-favorites, MRU position (lower = more recent) sorts first.
  const recentPos = recent.indexOf(id);
  // Canonical catalog order is the final tiebreaker.
  const canonicalPos = allTools().findIndex((t) => t.id === id);
  return [bucket, recentPos === -1 ? Number.MAX_SAFE_INTEGER : recentPos, canonicalPos];
}

/**
 * Return all tools in the unified ranked order.
 *
 * @param favorites durable favorites set
 * @param recent    durable recent MRU list (most recent first)
 */
export function rankTools(
  favorites: readonly ToolId[],
  recent: readonly ToolId[]
): readonly ToolCatalogEntry[] {
  const favSet = new Set(favorites);
  const ranked = [...allTools()].sort((a, b) => {
    const ka = rankKey(a.id, favSet, recent);
    const kb = rankKey(b.id, favSet, recent);
    for (let i = 0; i < 3; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i];
    }
    return 0;
  });
  return ranked;
}

/** Whether a tool id is in the favorites list. */
export function isFavorite(
  id: ToolId,
  favorites: readonly ToolId[]
): boolean {
  return favorites.indexOf(id) >= 0;
}
