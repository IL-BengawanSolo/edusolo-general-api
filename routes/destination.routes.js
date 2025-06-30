import { Router } from "express";
import {
  getDestinationBySlug,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
  getSimilarDestinations,
} from "../controllers/destination.controller.js";

import { getAgeCategories } from "../controllers/age_category.controller.js";
import { getPlaceTypes } from "../controllers/place_type.controller.js";
import { getRegions } from "../controllers/region.controller.js";
import { getCategories } from "../controllers/category.controller.js";


const destinationRouter = Router();

destinationRouter.get("/", getAllDestinations);
destinationRouter.get("/search", searchAndFilter);
destinationRouter.get("/age-categories", getAgeCategories);
destinationRouter.get("/place-types", getPlaceTypes);
destinationRouter.get("/regions", getRegions);
destinationRouter.get("/categories", getCategories);
destinationRouter.get("/:slug", getDestinationBySlug);
destinationRouter.get("/:slug/similar", getSimilarDestinations);
destinationRouter.post("/bulk", createDestinationBulk);


export default destinationRouter;
