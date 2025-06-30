import UserRepository from "../repository/user.repository.js";
import RecommendationSessionRepository from "../repository/recommendation_session.repository.js";
import RecommendationResultRepository from "../repository/recommendation_result.repository.js";

export const hasUserRecommendationSession = async (userId) => {
  return await UserRepository.hasRecommendationSession(userId);
};

export const createRecommendationSession = async (user_id) => {
  return await RecommendationSessionRepository.create({ user_id });
};

export const createRecommendationResult = async ({ session_id, place_id, score }) => {
  return await RecommendationResultRepository.create({ session_id, place_id, score });
};