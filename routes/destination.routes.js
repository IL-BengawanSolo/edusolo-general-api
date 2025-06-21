import { Router } from "express";
import {
  getDestinationBySlug,
  createDestinationBulk,
  getAllDestinations,
  searchAndFilter,
} from "../controllers/destination.controller.js";

const destinationRouter = Router();

destinationRouter.get("/", getAllDestinations);

destinationRouter.get("/search", searchAndFilter);

destinationRouter.get("/:slug", getDestinationBySlug);

destinationRouter.post("/bulk", createDestinationBulk);


export default destinationRouter;
