import { Router } from "express";
import { getRegions } from "../controllers/region.controller.js";

const regionRouter = Router();

regionRouter.get("/", getRegions);

export default regionRouter;