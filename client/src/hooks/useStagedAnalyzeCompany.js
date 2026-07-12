import { useState } from "react";
import { analyzeFacts, analyzeJudgment, getApiErrorMessage } from "../services/api.js";

export default function useStagedAnalyzeCompany() {
  const [facts, setFacts] = useState(null);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState("idle"); // idle | facts | judgment | notfound | done
  const [error, setError] = useState("");

  async function runAnalysis(company) {
    const trimmed = company.trim();

    if (!trimmed) {
      setError("Enter a company name.");
      return null;
    }

    setError("");
    setResult(null);
    setFacts(null);
    setStage("facts");

    try {
      const factsData = await analyzeFacts(trimmed);
      setFacts(factsData);

      if (factsData.companyExists === false) {
        setStage("notfound");
        return null;
      }

      setStage("judgment");

      const judgmentData = await analyzeJudgment(trimmed, factsData);
      const merged = { ...factsData, ...judgmentData };
      setResult(merged);
      setStage("done");
      return merged;
    } catch (err) {
      setError(getApiErrorMessage(err));
      setStage("idle");
      return null;
    }
  }

  function clearError() {
    setError("");
  }

  return { facts, result, stage, error, runAnalysis, clearError };
}