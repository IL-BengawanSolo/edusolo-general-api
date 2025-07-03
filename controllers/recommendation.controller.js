import { hasUserRecommendationSession } from "../services/recommendation.service.js";
import { createRecommendationSession } from "../services/recommendation.service.js";
import { createRecommendationResult } from "../services/recommendation.service.js";
import { getDestinationsByRecommendationSession } from "../services/recommendation.service.js";
import RecommendationSessionRepository from "../repository/recommendation_session.repository.js";


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

export const postRecommendationSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const session = await createRecommendationSession(userId);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("Error creating recommendation session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const { preferred_categories, n, session_id } = req.body;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing session_id" });
    }

    const response = await fetch(
      "https://farrah29-tourism-recommendation-api.hf.space/recommendations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_categories, n }),
      }
    );
    if (!response.ok) {
      return res
        .status(502)
        .json({ success: false, message: "AI service error" });
    }
    const data = await response.json();

    // Simpan hasil rekomendasi ke recommendation_results
    const savedResults = [];
    if (Array.isArray(data.recommendations)) {
      for (const rec of data.recommendations) {
        const place_id_str = rec["ID Tempat"];
        const place_id = parseInt(place_id_str.replace(/^T/, ""), 10);
        const score = rec["final_score %"];
        const result = await createRecommendationResult({
          session_id,
          place_id,
          score,
        });
        savedResults.push(result);
      }
    }

    res.json({ success: true, data: { ai: data, savedResults } });
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getDestinationsFromRecommendationResult = async (req, res) => {
  try {
    const { session_id } = req.params;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }
    const destinations = await getDestinationsByRecommendationSession(session_id);
    res.json({ success: true, data: destinations });
  } catch (error) {
    console.error("Error fetching destinations from recommendation result:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLastRecommendationSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const session = await RecommendationSessionRepository.findLastByUserId(userId);
    res.json({ success: true, data: session });
  } catch (error) {
    console.error("Error fetching last recommendation session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
