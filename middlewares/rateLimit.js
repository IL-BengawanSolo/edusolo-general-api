import rateLimit from "express-rate-limit";

export const chatbotRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Terlalu banyak permintaan ke chatbot. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bulkRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many bulk requests, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});