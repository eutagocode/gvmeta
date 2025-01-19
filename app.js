import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import userRouter from "./routes/userRouter.js";
import goalRouter from "./routes/goalRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use("/", express.json());
app.use("/gvmeta", userRouter);
app.use("/gvmeta", goalRouter);

mongoose.connect(process.env.MONGO_CONNECTION_URI);

app.listen({
    host: "0.0.0.0",
    port: process.env.PORT ?? 3000,
});
