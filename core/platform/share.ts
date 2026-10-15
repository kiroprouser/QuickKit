/** Centralized Web Share API access with safe fallback. */
import { capabilities } from "./capabilities";

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

/** Returns true if navigator.share was actually used (not a fallback). */
export async function share(payload: SharePayload): Promise<boolean> {
  if (capabilities.hasShare) {
    try {
      await navigator.share(payload);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
