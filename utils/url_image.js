export function addAbsoluteImageUrl(data, req, field = "thumbnail_url") {
  // Prefer explicit BASE_URL to avoid Host header poison; fallback to req host
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  if (Array.isArray(data)) {
    return data.map(row => ({
      ...row,
      [field]: row[field]
        ? (row[field].startsWith("http")
            ? row[field]
            : baseUrl + row[field])
        : null
    }));
  } else if (data && typeof data === "object") {
    return {
      ...data,
      [field]: data[field]
        ? (data[field].startsWith("http")
            ? data[field]
            : baseUrl + data[field])
        : null
    };
  }
  return data;
}