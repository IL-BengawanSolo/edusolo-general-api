import UserRepository from "../repository/user.repository.js";

export const hasUserRecommendationSession = async (userId) => {
  return await UserRepository.hasRecommendationSession(userId);
};