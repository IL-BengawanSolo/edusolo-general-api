import { hasUserRecommendationSession } from "../services/recommendation.service.js";

export const checkUserRecommendationSession = async (req, res) => {
  try {
    const userId = req.user?.id; // pastikan pakai auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const hasSession = await hasUserRecommendationSession(userId);
    res.json({ success: true, hasSession });
  } catch (error) {
    console.error("Error checking recommendation session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};