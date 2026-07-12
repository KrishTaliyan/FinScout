import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

const app = express();

const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Blocked by CORS policy."));
    }
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "finscout-api",
    model: env.GEMINI_MODEL,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "finscout-api",
    model: env.GEMINI_MODEL,
    timestamp: new Date().toISOString()
  });
});

app.use("/", analyzeRoutes);
app.use("/api", analyzeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
