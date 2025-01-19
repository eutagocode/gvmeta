import joi from "@hapi/joi";

const registerValidate = (data) => {
    const schema = joi.object({
        username: joi.string().min(3),
        email: joi.string().required().min(13),
        password: joi.string().required().min(8),
    });

    return schema.validate(data);
};

const loginValidate = (data) => {
    const schema = joi.object({
        email: joi.string().required().min(13),
        password: joi.string().required().min(8),
    });

    return schema.validate(data);
};

export { registerValidate, loginValidate };
