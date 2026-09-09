import QuestionsRepository from "../repository/questions.repository.js";
import { getCache, setCache } from "../utils/cache.js";

export const getActiveQuestions = async () => {
  const key = "questions:active";
  const cached = getCache(key);
  if (cached) return cached;
  const data = await QuestionsRepository.findActive();
  setCache(key, data, 5 * 60 * 1000);
  return data;
};