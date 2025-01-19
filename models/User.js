import { Schema, model } from "mongoose";

const userSchema = Schema({
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, minlength: 13 },
    password: { type: String, required: true, minlength: 8 },
});

export default model("User", userSchema);
