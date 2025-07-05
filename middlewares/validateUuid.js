import PlaceRepository from "../repository/destination.repository.js";

export const validateUuid = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    // Gunakan repository untuk mencari destinasi berdasarkan UUID
    const place = await PlaceRepository.findByUuid(uuid);
    if (!place) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    req.placeId = place.id;
    req.slug = place.slug;
    next();
  } catch (error) {
    console.error("Error validating UUID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};