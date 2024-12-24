import express from "express";
import { goalControllers, updateSold } from "../controllers/goalControllers.js";

const router = express.Router();

router.post("/creategoal", goalControllers);

router.post("/updatesold/:id", updateSold);

export default router;
