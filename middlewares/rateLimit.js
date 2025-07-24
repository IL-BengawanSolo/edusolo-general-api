import rateLimit from "express-rate-limit";

export const chatbotRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // maksimal 10 request per IP per windowMs
  message: {
    success: false,
    message: "Terlalu banyak permintaan ke chatbot. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});