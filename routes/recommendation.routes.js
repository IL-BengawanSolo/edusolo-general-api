import { Router } from "express";
import passport from "../config/passport.js";
import { checkUserRecommendationSession } from "../controllers/recommendation.controller.js";
import { getQuestions } from "../controllers/question.controller.js"; // tambahkan import ini

const recommendationRouter = Router();

recommendationRouter.get(
  "/has-session",
  passport.authenticate("jwt", { session: false }),
  checkUserRecommendationSession
);

recommendationRouter.get("/questions", getQuestions);

export default recommendationRouter;