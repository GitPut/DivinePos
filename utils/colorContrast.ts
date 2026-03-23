/**
 * Returns true if the given hex color is "light" (should use dark text).
 * Uses relative luminance formula (WCAG).
 */
export function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 4) return false;
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  const luminance =
    0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  return luminance > 0.4;
}

/**
 * Returns a set of CSS-ready color values based on whether the brand color is light or dark.
 */
export function getContrastStyles(brandColor: string) {
  const light = isLightColor(brandColor || "#0d0d0d");
  return {
    isLight: light,
    text: light ? "#0f172a" : "#fff",
    textMuted: light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
    textFaint: light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.5)",
    inputBg: light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
    inputBorder: light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)",
    inputText: light ? "#0f172a" : "#fff",
    inputPlaceholder: light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.45)",
    btnBg: light ? "#0f172a" : "#fff",
    btnText: light ? "#fff" : "#0f172a",
    divider: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)",
    overlay: light ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.1)",
    overlayBorder: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)",
    overlayHover: light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
    iconCircleBg: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)",
  };
}
