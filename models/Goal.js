import { Schema, model } from "mongoose";

const goalSchema = Schema({
    goal: { type: Number, required: true, default: 0 },
    proportional: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    missingDays: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 0 },
});

export default model("Goal", goalSchema);
