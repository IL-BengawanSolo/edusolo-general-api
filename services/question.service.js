import QuestionsRepository from "../repository/questions.repository.js";

export const getActiveQuestions = async () => {
  return await QuestionsRepository.findActive();
};