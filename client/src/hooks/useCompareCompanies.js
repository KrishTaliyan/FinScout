import { useState } from "react";
import { analyzeCompany, getApiErrorMessage } from "../services/api.js";

export default function useCompareCompanies() {
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [errorA, setErrorA] = useState("");
  const [errorB, setErrorB] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runCompare(companyA, companyB) {
    const trimmedA = companyA.trim();
    const trimmedB = companyB.trim();

    setErrorA("");
    setErrorB("");

    if (!trimmedA || !trimmedB) {
      if (!trimmedA) setErrorA("Enter a company name.");
      if (!trimmedB) setErrorB("Enter a company name.");
      return;
    }

    setIsLoading(true);
    setResultA(null);
    setResultB(null);

    const [outcomeA, outcomeB] = await Promise.allSettled([
      analyzeCompany(trimmedA),
      analyzeCompany(trimmedB)
    ]);

    if (outcomeA.status === "fulfilled") {
      setResultA(outcomeA.value);
    } else {
      setErrorA(getApiErrorMessage(outcomeA.reason));
    }

    if (outcomeB.status === "fulfilled") {
      setResultB(outcomeB.value);
    } else {
      setErrorB(getApiErrorMessage(outcomeB.reason));
    }

    setIsLoading(false);
  }

  function reset() {
    setResultA(null);
    setResultB(null);
    setErrorA("");
    setErrorB("");
  }

  return { resultA, resultB, errorA, errorB, isLoading, runCompare, reset };
}