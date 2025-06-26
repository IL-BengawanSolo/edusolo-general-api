import { Router } from "express";
import { getAgeCategories } from "../controllers/age_category.controller.js";

const ageCategoryRouter = Router();

ageCategoryRouter.get("/", getAgeCategories);

export default ageCategoryRouter;