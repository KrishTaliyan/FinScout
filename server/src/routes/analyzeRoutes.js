import { Router } from "express";
import {
  analyzeCompanyController,
  analyzeFactsController,
  analyzeJudgmentController,
  followUpController
} from "../controllers/analyzeController.js";
import validateRequest from "../middleware/validateRequest.js";
import { analyzeRequestSchema, judgmentRequestSchema, followUpRequestSchema } from "../langchain/schemas.js";

const router = Router();

router.post("/analyze", validateRequest(analyzeRequestSchema), analyzeCompanyController);
router.post("/analyze/facts", validateRequest(analyzeRequestSchema), analyzeFactsController);
router.post("/analyze/judgment", validateRequest(judgmentRequestSchema), analyzeJudgmentController);
router.post("/analyze/followup", validateRequest(followUpRequestSchema), followUpController);

export default router;