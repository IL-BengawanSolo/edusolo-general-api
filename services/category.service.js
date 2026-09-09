import CategoryRepository from "../repository/category.repository.js";
import { getCache, setCache } from "../utils/cache.js";

export const getAllCategories = async () => {
  const key = "categories:all";
  const cached = getCache(key);
  if (cached) return cached;
  const data = await CategoryRepository.findAll();
  setCache(key, data, 5 * 60 * 1000);
  return data;
};