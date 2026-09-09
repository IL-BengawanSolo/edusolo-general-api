import AgeCategoryRepository from "../repository/age_category.repository.js";
import { getCache, setCache } from "../utils/cache.js";

export const getAllAgeCategories = async () => {
  const key = "age_categories:all";
  const cached = getCache(key);
  if (cached) return cached;
  const data = await AgeCategoryRepository.findAll();
  setCache(key, data, 5 * 60 * 1000);
  return data;
};