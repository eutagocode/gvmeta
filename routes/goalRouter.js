import express from "express";
import {
    goalControllers,
    updateSold,
    removeSold,
} from "../controllers/goalControllers.js";

const router = express.Router();

router.post("/creategoal", goalControllers);

router.post("/updatesold/:id", updateSold);

router.delete("/removesold/:id", removeSold);

export default router;
