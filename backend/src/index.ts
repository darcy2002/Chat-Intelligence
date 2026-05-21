import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import chatRouter from "./routes/chat.js";

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.use("/api/chat", chatRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});

// Vercel handles the server lifecycle; other hosts need explicit listen
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

export default app;
