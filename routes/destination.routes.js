import { Router } from "express";
import {
  getDestinationBySlug,
  getDestinationByUuid,
  createDestination,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
  getSimilarDestinations,
  updateDestination,
  deleteDestination,
} from "../controllers/destination.controller.js";

import {
  uploadPlaceImage,
  getPlaceImages,
  uploadPlaceImagesBulk,
  deletePlaceImage,
  setPrimaryImage,
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
import { paginationQuerySchema, searchQuerySchema, similarQuerySchema, slugParamSchema, uuidParamSchema, singleDestinationSchema, updateDestinationSchema, imageIdParamSchema } from "../utils/validators.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const destinationRouter = Router();

destinationRouter.get("/", validate(paginationQuerySchema, "query"), getAllDestinations);
destinationRouter.get("/search", validate(searchQuerySchema, "query"), searchAndFilter);
destinationRouter.get("/age-categories", getAgeCategories);
destinationRouter.get("/place-types", getPlaceTypes);
destinationRouter.get("/regions", getRegions);
destinationRouter.get("/categories", getCategories);
destinationRouter.get("/by-uuid/:uuid", passport.authenticate("jwt", { session: false }), requireAdmin, validate(uuidParamSchema, "params"), validateUuid, getDestinationByUuid);
destinationRouter.get("/:slug", validate(slugParamSchema, "params"), getDestinationBySlug);
destinationRouter.get("/:slug/similar", validate(slugParamSchema, "params"), validate(similarQuerySchema, "query"), getSimilarDestinations);
destinationRouter.post("/", passport.authenticate("jwt", { session: false }), requireAdmin, validate(singleDestinationSchema), createDestination);
destinationRouter.put("/:uuid", passport.authenticate("jwt", { session: false }), requireAdmin, validate(uuidParamSchema, "params"), validateUuid, validate(updateDestinationSchema), updateDestination);
destinationRouter.delete("/:uuid", passport.authenticate("jwt", { session: false }), requireAdmin, validate(uuidParamSchema, "params"), validateUuid, deleteDestination);
destinationRouter.post("/bulk", passport.authenticate("jwt", { session: false }), requireAdmin, bulkRateLimiter, createDestinationBulk);

// Routes for images
destinationRouter.post(
  "/:uuid/upload-image",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  validateUuid,
  upload.single("image"),
  uploadPlaceImage
);

destinationRouter.post(
  "/:uuid/upload-images",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  validateUuid,
  upload.array("images", 10),
  uploadPlaceImagesBulk
);

destinationRouter.get("/:uuid/images", validate(uuidParamSchema, "params"), validateUuid, getPlaceImages);
destinationRouter.delete("/:uuid/images/:imageId", passport.authenticate("jwt", { session: false }), requireAdmin, validate(imageIdParamSchema, "params"), validateUuid, deletePlaceImage);
destinationRouter.patch("/:uuid/images/:imageId/primary", passport.authenticate("jwt", { session: false }), requireAdmin, validate(imageIdParamSchema, "params"), validateUuid, setPrimaryImage);
export default destinationRouter;
