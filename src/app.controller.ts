import express from "express";
import type { Express, Request, Response } from "express";
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/Users/user.controller";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { config } from "dotenv";
import { globalErrorHandling } from "./Utils/Responsive/error.res";
import connectDB from "./DB/connection";

config({ path: path.resolve("./config/.env.dev") });
const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    status: 429,
    message: "Too many request , p;ease try again later",
  },
});
const bootstrab = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;
  app.use(cors(), helmet(), express.json());
  app.use(limit);
  await connectDB();

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);

  app.use("{/dummy}", (req: Request, res: Response) => {
    res.status(404).json({ message: "not founded" });
  });
  app.listen(port, () => {
    console.log(`Server is running om http://localhost:${port}`);
  });

  app.use(globalErrorHandling);
};

export default bootstrab;
