import { Router } from "express";
import {
  getDestinationBySlug,
  createDestination,
  createDestinationBulk,
  getAllDestinationsWithRelations,

} from "../controllers/destination.controller.js";

const destinationRouter = Router();

destinationRouter.get("/", getAllDestinationsWithRelations);

destinationRouter.get("/:slug", getDestinationBySlug);

destinationRouter.post("/", createDestination);

destinationRouter.post("/bulk", createDestinationBulk);

export default destinationRouter;
