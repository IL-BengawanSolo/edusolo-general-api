import { getAllAgeCategories } from "../services/age_category.service.js";

export const getAgeCategories = async (req, res) => {
  try {
    const ageCategories = await getAllAgeCategories();
    res.json({ success: true, data: ageCategories });
  } catch (error) {
    console.error("Error fetching age categories:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};