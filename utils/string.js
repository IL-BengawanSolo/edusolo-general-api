export function splitCommaString(str) {
  if (Array.isArray(str)) return str;
  if (typeof str === "string") {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
