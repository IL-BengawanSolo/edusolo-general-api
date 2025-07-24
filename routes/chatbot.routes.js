import { Router } from "express";
import { chatWithGroq } from "../controllers/chatbot.controller.js";

const router = Router();
router.post("/chat", chatWithGroq);
export default router;