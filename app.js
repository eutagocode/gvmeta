import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRouter from "./routes/userRouter.js";
import goalRouter from "./routes/goalRouter.js";

dotenv.config();

const app = express();

app.use("/", express.json());
app.use("/gvmeta", userRouter);
app.use("/gvmeta", goalRouter);

mongoose.connect(process.env.MONGO_CONNECTION_URI);

app.listen(process.env.PORT, () =>
    console.log("listening on port", process.env.PORT),
);
