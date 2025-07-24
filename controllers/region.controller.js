import { getAllRegions } from "../services/region.service.js";

export const getRegions = async (req, res) => {
  try {
    const regions = await getAllRegions();
    res.json({ success: true, data: regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};