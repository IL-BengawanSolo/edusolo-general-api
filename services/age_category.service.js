import AgeCategoryRepository from "../repository/age_category.repository.js";

export const getAllAgeCategories = async () => {
  return await AgeCategoryRepository.findAll();
};