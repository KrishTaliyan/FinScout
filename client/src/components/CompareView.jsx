import { useState } from "react";
import CompareForm from "./CompareForm.jsx";
import CompareResultCard from "./CompareResultCard.jsx";
import useCompareCompanies from "../hooks/useCompareCompanies.js";

export default function CompareView({ initialCompanyA = "" }) {
  const [companyA, setCompanyA] = useState(initialCompanyA);
  const [companyB, setCompanyB] = useState("");
  const { resultA, resultB, errorA, errorB, isLoading, runCompare } = useCompareCompanies();

  function handleSubmit(event) {
    event.preventDefault();
    runCompare(companyA, companyB);
  }

  const hasOutput = resultA || resultB || errorA || errorB || isLoading;

  return (
    <div className="space-y-6">
      <CompareForm
        companyA={companyA}
        companyB={companyB}
        setCompanyA={setCompanyA}
        setCompanyB={setCompanyB}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      {hasOutput && (
        <div className="grid gap-5 md:grid-cols-2">
          <CompareResultCard result={resultA} error={errorA} isLoading={isLoading} />
          <CompareResultCard result={resultB} error={errorB} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}