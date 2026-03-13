/* ── Font Injection & Helpers ────────────────────────────────── */

// Inject custom fonts once globally
export function injectCustomFonts() {
  if (document.getElementById("zhop-fonts")) return;
  const link = document.createElement("link");
  link.id = "zhop-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap";
  document.head.appendChild(link);
}

// Font style helpers (use these in components)
export const FONT_DISPLAY = { fontFamily: "'Syne', sans-serif" };
export const FONT_BODY = { fontFamily: "'DM Sans', sans-serif" };
