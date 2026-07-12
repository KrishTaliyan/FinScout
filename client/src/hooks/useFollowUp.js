import { useState } from "react";
import { askFollowUp, getApiErrorMessage } from "../services/api.js";

export default function useFollowUp(company, context) {
  const [questions, setQuestions] = useState([]);

  async function ask(question) {
    const trimmed = question.trim();
    if (!trimmed) return;

    const id = `${Date.now()}-${Math.random()}`;
    setQuestions((current) => [
      ...current,
      { id, question: trimmed, isLoading: true, error: "", answerPoints: [], isAnswerable: true }
    ]);

    try {
      const data = await askFollowUp(company, context, trimmed);
      setQuestions((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, isLoading: false, answerPoints: data.answerPoints, isAnswerable: data.isAnswerable }
            : item
        )
      );
    } catch (err) {
      setQuestions((current) =>
        current.map((item) => (item.id === id ? { ...item, isLoading: false, error: getApiErrorMessage(err) } : item))
      );
    }
  }

  return { questions, ask };
}