import PlaceImageRepository from "../repository/place_image.repository.js";

export const uploadImage = async (placeId, filePath, isPrimary = false) => {
  if (isPrimary) {
    // Ensure only one primary per place: clear old primaries first
    const db = (await import("../database/db.js")).default;
    await db.query("UPDATE place_images SET is_primary = 0 WHERE place_id = ?", [placeId]);
  }
  return await PlaceImageRepository.create({
    place_id: placeId,
    image_url: filePath,
    is_primary: isPrimary ? 1 : 0,
  });
};

export const getImagesByPlaceId = async (placeId) => {
  return await PlaceImageRepository.findByPlaceId(placeId);
};

export const deleteImage = async (placeId, imageId) => {
  const img = await PlaceImageRepository.findById(imageId);
  if (!img || String(img.place_id) !== String(placeId)) return false;
  const fs = await import("fs");
  const path = await import("path");
  for (const base of [process.cwd(), "/tmp"]) {
    try {
      const p = path.join(base, img.image_url.replace(/^\//, ""));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}
  }
  return await PlaceImageRepository.deleteById(imageId);
};

export const setPrimaryImage = async (placeId, imageId) => {
  const img = await PlaceImageRepository.findById(imageId);
  if (!img || String(img.place_id) !== String(placeId)) return false;
  return await PlaceImageRepository.setPrimary(placeId, imageId);
};