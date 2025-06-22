import { Router } from "express";
import { getPlaceTypes } from "../controllers/place_type.controller.js";

const placeTypeRouter = Router();

placeTypeRouter.get("/", getPlaceTypes);

export default placeTypeRouter;