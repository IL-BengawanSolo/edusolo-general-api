import { Router } from "express";
import {
  getDestinationBySlug,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
  getSimilarDestinations,
} from "../controllers/destination.controller.js";

const destinationRouter = Router();

destinationRouter.get("/", getAllDestinations);

destinationRouter.get("/search", searchAndFilter);

destinationRouter.get("/:slug", getDestinationBySlug);

destinationRouter.get("/:slug/similar", getSimilarDestinations);

destinationRouter.post("/bulk", createDestinationBulk);


export default destinationRouter;
