import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rootRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { setupAuditContext, auditErrorHandler } from "./middlewares/audit.middleware.js";

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);

// Cookie Parser & Body Parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Audit Context Setup (before routes)
app.use(setupAuditContext);

// Routing API
app.use("/api", rootRouter);

// Audit Error Handler (before general error handler)
app.use(auditErrorHandler);

// Error Handling Middleware
app.use(errorHandler as any);

export default app;
