import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" }
});

export async function analyzeCompany(company) {
  const response = await api.post("/analyze", { company });
  return response.data.data;
}

export async function analyzeFacts(company) {
  const response = await api.post("/analyze/facts", { company });
  return response.data.data;
}

export async function analyzeJudgment(company, facts) {
  const response = await api.post("/analyze/judgment", { company, facts });
  return response.data.data;
}

export async function askFollowUp(company, context, question) {
  const response = await api.post("/analyze/followup", { company, context, question });
  return response.data.data;
}

export function getApiErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ECONNABORTED") return "The research request took too long. Please try again.";
  if (error.request) return "Unable to reach the FinScout server. Make sure the backend is running.";
  return "Something went wrong while preparing your request.";
}