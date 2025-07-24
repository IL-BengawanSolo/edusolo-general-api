import UserRepository from "../repository/user.repository.js";
import RecommendationSessionRepository from "../repository/recommendation_session.repository.js";
import RecommendationResultRepository from "../repository/recommendation_result.repository.js";

function splitCommaString(str) {
  if (Array.isArray(str)) return str;
  if (typeof str === "string") {
    return str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const hasUserRecommendationSession = async (userId) => {
  return await UserRepository.hasRecommendationSession(userId);
};

export const createRecommendationSession = async (user_id) => {
  return await RecommendationSessionRepository.create({ user_id });
};

export const createRecommendationResult = async ({
  session_id,
  place_id,
  score,
}) => {
  return await RecommendationResultRepository.create({
    session_id,
    place_id,
    score,
  });
};

export const getDestinationsByRecommendationSession = async (session_id) => {
  const rows = await RecommendationResultRepository.findDestinationsBySessionId(
    session_id
  );

  return rows.map((row) => ({
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
  }));
};
