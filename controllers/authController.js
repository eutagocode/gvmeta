import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const token = req.header("auth-token");

    if (!token) return res.status(401).send("Acesso negado.");

    try {
        const userVerified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = userVerified;
        next();
    } catch (error) {
        res.status(401).send("Acesso negado.");
    }
};
