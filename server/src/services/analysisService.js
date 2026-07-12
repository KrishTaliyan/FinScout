import { runInvestmentAgent, getCompanyFacts, getInvestmentJudgment, getFollowUpAnswer } from "../langchain/investmentAgent.js";

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();
const followUpCache = new Map();

function getCacheKey(company) {
  return company.trim().toLowerCase();
}

function getFollowUpCacheKey(company, question) {
  return `${company.trim().toLowerCase()}::${question.trim().toLowerCase()}`;
}

export async function analyzeCompany(company) {
  const normalizedCompany = company.trim().replace(/\s+/g, " ");
  const cacheKey = getCacheKey(normalizedCompany);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, fromCache: true };
  }

  const result = await runInvestmentAgent(normalizedCompany);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return { ...result, fromCache: false };
}

export async function getCompanyFactsService(company) {
  const normalizedCompany = company.trim().replace(/\s+/g, " ");
  return getCompanyFacts(normalizedCompany);
}

export async function getJudgmentService(company, facts) {
  const normalizedCompany = company.trim().replace(/\s+/g, " ");
  const judgment = await getInvestmentJudgment(normalizedCompany, facts);

  // Cache the full merged result too, so a later single-call /analyze
  // for the same company (e.g. from Compare mode) is instant.
  cache.set(getCacheKey(normalizedCompany), { data: { ...facts, ...judgment }, timestamp: Date.now() });

  return judgment;
}

export async function getFollowUpAnswerService(company, context, question) {
  const normalizedCompany = company.trim().replace(/\s+/g, " ");
  const cacheKey = getFollowUpCacheKey(normalizedCompany, question);
  const cached = followUpCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const answer = await getFollowUpAnswer(normalizedCompany, context, question);
  followUpCache.set(cacheKey, { data: answer, timestamp: Date.now() });
  return answer;
}