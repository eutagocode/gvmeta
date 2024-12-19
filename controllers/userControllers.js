import bcrypt from "bcryptjs";
import User from "../models/User.js";

const register = async (req, res) => {
    const selectedUser = await User.findOne({ email: req.body.email });
    if (selectedUser) return res.status(400).send("Este e-mail já existe!");

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hashSync(req.body.password),
    });

    try {
        const userSaved = await user.save();
        res.send(userSaved);
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    const selectedUser = await User.findOne({ email: req.body.email });
    if (!selectedUser)
        return res.status(400).send("E-mail ou senha estão incorretos.");

    const passwordCompare = await bcrypt.compareSync(
        req.body.password,
        selectedUser.password,
    );

    if (!passwordCompare)
        return res.status(400).send("E-mail ou senha estão incorretos.");

    res.send("User logged");
};

export { register, login };
