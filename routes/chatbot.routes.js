import { Router } from "express";
import { chatWithGroq } from "../controllers/chatbot.controller.js";
import { chatbotRateLimiter } from "../middlewares/rateLimit.js";

const router = Router();
router.post("/chat", chatbotRateLimiter, chatWithGroq);
export default router;