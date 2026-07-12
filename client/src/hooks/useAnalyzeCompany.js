import { useState } from "react";
import { analyzeCompany, getApiErrorMessage } from "../services/api.js";

export default function useAnalyzeCompany() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runAnalysis(company) {
    const trimmedCompany = company.trim();

    if (!trimmedCompany) {
      setError("Enter a company name to begin.");
      return null;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await analyzeCompany(trimmedCompany);
      setResult(data);
      return data;
    } catch (apiError) {
      const message = getApiErrorMessage(apiError);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setError("");
  }

  return {
    result,
    error,
    isLoading,
    runAnalysis,
    clearError
  };
}
