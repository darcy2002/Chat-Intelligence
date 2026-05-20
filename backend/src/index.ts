import express, { type NextFunction, type Request, type Response } from "express";
import "dotenv/config";
import chatRouter from "./routes/chat.js";

const app = express();
app.use(express.json());

app.use("/api/chat", chatRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
