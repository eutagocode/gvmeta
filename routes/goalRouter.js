import express from "express";
import {
    getData,
    createGoal,
    updateSold,
    removeSold,
    deleteGoal,
} from "../controllers/goalControllers.js";

const router = express.Router();

router.get("/", getData);

router.post("/creategoal", createGoal);

router.post("/updatesold/:id", updateSold);

router.delete("/removesold/:id", removeSold);

router.delete("/deletegoal/:id", deleteGoal);

export default router;
