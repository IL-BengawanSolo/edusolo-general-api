import { hasUserRecommendationSession } from "../services/recommendation.service.js";
import { createRecommendationSession } from "../services/recommendation.service.js";
import { createRecommendationResult } from "../services/recommendation.service.js";
import { getDestinationsByRecommendationSession } from "../services/recommendation.service.js";
import RecommendationSessionRepository from "../repository/recommendation_session.repository.js";
import { addAbsoluteImageUrl } from "../utils/url_image.js";

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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const { preferred_categories, n, session_id } = req.body;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing session_id" });
    }
    const session = await RecommendationSessionRepository.findById(session_id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (String(session.user_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden: session does not belong to user" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(
      "https://farrah29-tourism-recommendation-api.hf.space/recommendations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_categories, n: Math.min(Math.max(parseInt(n, 10) || 8, 1), 20) }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!response.ok) {
      return res
        .status(502)
        .json({ success: false, message: "AI service error" });
    }
    const data = await response.json();

    // Bulk insert with validation and transaction
    let savedResults = [];
    if (Array.isArray(data.recommendations)) {
      const rows = [];
      for (const rec of data.recommendations) {
        const place_id_str = rec["ID Tempat"];
        const place_id = parseInt(String(place_id_str).replace(/^T/, ""), 10);
        const score = Number(rec["final_score %"]);
        if (!Number.isInteger(place_id) || Number.isNaN(score)) continue;
        rows.push({ session_id, place_id, score });
      }
      if (rows.length) {
        const db = (await import("../database/db.js")).default;
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();
          const placeholders = rows.map(() => "(?, ?, ?)").join(", ");
          const flat = rows.flatMap((r) => [r.session_id, r.place_id, r.score]);
          await conn.query(`INSERT INTO recommendation_results (session_id, place_id, score) VALUES ${placeholders}`, flat);
          await conn.commit();
          savedResults = rows;
        } catch (e) {
          await conn.rollback();
          throw e;
        } finally {
          conn.release();
        }
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
    const userId = req.user?.id;
    const { session_id } = req.params;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }
    const session = await RecommendationSessionRepository.findById(session_id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (String(session.user_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const destinations = await getDestinationsByRecommendationSession(session_id);
        const destinationsWithUrl = addAbsoluteImageUrl(destinations, req);
    res.json({ success: true, data: destinationsWithUrl });
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
