import { Router } from "express";
import {
  getDestinationBySlug,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
  getSimilarDestinations,
} from "../controllers/destination.controller.js";

import {
  uploadPlaceImage,
  getPlaceImages,
  uploadPlaceImagesBulk,
} from "../controllers/place_image.controller.js";

import upload from "../middlewares/upload.js";
import { validateUuid } from "../middlewares/validateUuid.js";
import passport from "../config/passport.js";
import { bulkRateLimiter } from "../middlewares/rateLimit.js";

import { getAgeCategories } from "../controllers/age_category.controller.js";
import { getPlaceTypes } from "../controllers/place_type.controller.js";
import { getRegions } from "../controllers/region.controller.js";
import { getCategories } from "../controllers/category.controller.js";
import { validate } from "../middlewares/validate.js";
import { paginationQuerySchema, searchQuerySchema, similarQuerySchema, slugParamSchema, uuidParamSchema } from "../utils/validators.js";

const destinationRouter = Router();

destinationRouter.get("/", validate(paginationQuerySchema, "query"), getAllDestinations);
destinationRouter.get("/search", validate(searchQuerySchema, "query"), searchAndFilter);
destinationRouter.get("/age-categories", getAgeCategories);
destinationRouter.get("/place-types", getPlaceTypes);
destinationRouter.get("/regions", getRegions);
destinationRouter.get("/categories", getCategories);
destinationRouter.get("/:slug", validate(slugParamSchema, "params"), getDestinationBySlug);
destinationRouter.get("/:slug/similar", validate(slugParamSchema, "params"), validate(similarQuerySchema, "query"), getSimilarDestinations);
destinationRouter.post("/bulk", passport.authenticate("jwt", { session: false }), bulkRateLimiter, createDestinationBulk);

// Routes for images
destinationRouter.post(
  "/:uuid/upload-image",
  passport.authenticate("jwt", { session: false }),
  validateUuid,
  upload.single("image"),
  uploadPlaceImage
);

destinationRouter.post(
  "/:uuid/upload-images",
  passport.authenticate("jwt", { session: false }),
  validateUuid,
  upload.array("images", 10),
  uploadPlaceImagesBulk
);

destinationRouter.get("/:uuid/images", validate(uuidParamSchema, "params"), validateUuid, getPlaceImages);
export default destinationRouter;
