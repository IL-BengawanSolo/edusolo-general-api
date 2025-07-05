import { Router } from "express";
import {
  getDestinationBySlug,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
  getSimilarDestinations,
} from "../controllers/destination.controller.js";

import { uploadPlaceImage, getPlaceImages } from "../controllers/place_image.controller.js";

import upload from "../middlewares/upload.js";
import { validateUuid } from "../middlewares/validateUuid.js";

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

// Routes for images
destinationRouter.post(
  "/:uuid/upload-image",
  validateUuid,
  upload.single("image"),
  uploadPlaceImage
);

destinationRouter.get("/:uuid/images", validateUuid, getPlaceImages);
export default destinationRouter;
