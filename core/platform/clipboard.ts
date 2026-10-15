/** Centralized clipboard access with safe fallbacks. */
import { capabilities } from "./capabilities";

export async function copyText(text: string): Promise<boolean> {
  if (capabilities.hasClipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy
    }
  }
  if (capabilities.isBrowser) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}

export async function copyBlob(type: string, blob: Blob): Promise<boolean> {
  if (capabilities.hasClipboard && capabilities.hasClipboardItem) {
    try {
      const ClipboardItem = (window as any).ClipboardItem;
      const item = new ClipboardItem({ [type]: blob });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
