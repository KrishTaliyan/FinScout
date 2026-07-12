import {
  analyzeCompany,
  getCompanyFactsService,
  getJudgmentService,
  getFollowUpAnswerService
} from "../services/analysisService.js";

export async function analyzeCompanyController(request, response, next) {
  try {
    const result = await analyzeCompany(request.validatedBody.company);
    response.json({ success: true, data: result, meta: { generatedAt: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
}

export async function analyzeFactsController(request, response, next) {
  try {
    const facts = await getCompanyFactsService(request.validatedBody.company);
    response.json({ success: true, data: facts, meta: { generatedAt: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
}

export async function analyzeJudgmentController(request, response, next) {
  try {
    const judgment = await getJudgmentService(request.validatedBody.company, request.validatedBody.facts);
    response.json({ success: true, data: judgment, meta: { generatedAt: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
}

export async function followUpController(request, response, next) {
  try {
    const { company, context, question } = request.validatedBody;
    const answer = await getFollowUpAnswerService(company, context, question);
    response.json({ success: true, data: answer, meta: { generatedAt: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
}




