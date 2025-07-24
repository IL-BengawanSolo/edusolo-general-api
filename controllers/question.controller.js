import { getActiveQuestions } from "../services/question.service.js";

export const getQuestions = async (req, res) => {
  try {
    const questions = await getActiveQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};