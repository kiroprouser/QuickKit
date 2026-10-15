/** Centralized haptics. No-op when unsupported or disabled. */
import { capabilities } from "./capabilities";
import { usePersistentStore } from "@core/runtime/persistent-store";

export function haptic(pattern: number | number[] = 10): void {
  if (!capabilities.hasVibration) return;
  const enabled = usePersistentStore.getState().haptics;
  if (!enabled) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
