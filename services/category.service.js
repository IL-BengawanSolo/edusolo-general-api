import CategoryRepository from "../repository/category.repository.js";

export const getAllCategories = async () => {
  return await CategoryRepository.findAll();
};