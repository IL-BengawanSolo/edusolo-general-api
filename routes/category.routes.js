import { Router } from "express";
import { getCategories } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);

export default categoryRouter;