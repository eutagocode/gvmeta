import express from "express";
import { goalControllers } from "../controllers/goalControllers.js";

const router = express.Router();

router.post("/creategoal", goalControllers);

export default router;
