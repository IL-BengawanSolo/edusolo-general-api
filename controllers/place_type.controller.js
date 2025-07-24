import { getAllPlaceTypes } from "../services/place_type.service.js";

export const getPlaceTypes = async (req, res) => {
  try {
    const placeTypes = await getAllPlaceTypes();
    res.json({ success: true, data: placeTypes });
  } catch (error) {
    console.error("Error fetching place types:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};