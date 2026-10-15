import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BASE_METADATA } from "@core/seo/metadata";
import { AppRuntime } from "@core/runtime/app-runtime";
import "@styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jbm = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jbm",
});

export const metadata: Metadata = BASE_METADATA;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#181411" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/**
 * Prepaint theme script — eliminates first-paint theme flashing by applying
 * the persisted theme to <html> before hydration. Reads from localStorage
 * (key must match the PersistentAppStore key), falls back to system.
 */
const PREPAINT_THEME_SCRIPT = `
(function() {
  try {
    var KEY = "quickkit.state.v1";
    var raw = localStorage.getItem(KEY);
    var theme = "system";
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.state && parsed.state.theme) {
        theme = parsed.state.theme;
      }
    }
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    if (resolved === "dark") document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${jbm.variable} min-h-screen flex flex-col antialiased`}>
        <AppRuntime>{children}</AppRuntime>
      </body>
    </html>
  );
}
