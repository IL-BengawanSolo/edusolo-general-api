import db from "../database/db.js";

const table = "questions";

const QuestionsRepository = {
  async findActive() {
    const [rows] = await db.query(
      `SELECT id, question_text, answer_choices FROM ${table} WHERE is_active = 1 ORDER BY id`
    );
    return rows;
  },
};

export default QuestionsRepository;