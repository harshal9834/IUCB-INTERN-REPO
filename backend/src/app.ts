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
    origin: (origin, callback) => {
      // Allow any localhost origin in dev, plus the configured FRONTEND_URL
      const allowed = [
        process.env.FRONTEND_URL || "http://localhost:8080",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
        "http://localhost:3000",
        "http://localhost:5173",
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow all in dev — tighten for production
      }
    },
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
