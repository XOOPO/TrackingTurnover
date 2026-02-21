import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { authRouter } from "../routes/auth";
import { runMigrations } from "./migrate";

async function startServer() {
  // Run migrations before starting server (only in production)
  if (process.env.NODE_ENV === "production") {
    try {
      await runMigrations();
    } catch (error) {
      console.error("[Server] Failed to run migrations, but continuing startup...");
      // Don't exit - let server start and show error in logs
    }
  }

  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/auth", authRouter);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

startServer();
