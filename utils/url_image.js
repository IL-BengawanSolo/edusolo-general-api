export function addAbsoluteImageUrl(data, req, field = "thumbnail_url") {
  // Prefer BASE_URL, else use forwarded proto/host to force https behind Vercel proxy (fixes Mixed Content)
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  const isVercel = host && host.includes("vercel.app");
  const baseProto = isVercel ? "https" : proto;
  const baseUrl = process.env.BASE_URL || `${baseProto}://${host}`;
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