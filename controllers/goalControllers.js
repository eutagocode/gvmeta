import Goal from "../models/Goal.js";
import {
    getRemainingBusinessDays,
    proportionalWorkingDays,
} from "./calculateDays.js";
const date = new Date();

const updatedDaily = async (soldTotal, goal, id) => {
    const updateDaily =
        (goal - soldTotal) /
        getRemainingBusinessDays(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );

    if (soldTotal >= goal) {
        await Goal.updateOne({ _id: id }, { dailyGoal: 0 });
        res.send("Venda adicionada com sucesso!");
        return;
    }

    await Goal.updateOne(
        { _id: id },
        { dailyGoal: parseFloat(updateDaily).toFixed(2) },
    );
};

const createGoal = async (req, res) => {
    const goalValue = req.body.goal;

    if (goalValue === "" || goalValue === 0) {
        return res
            .status(400)
            .send("Ops, você está tentando mandar um valor vazio como meta.");
    }

    const existGoal = await Goal.find({});

    if (existGoal.length === 1) {
        const id = existGoal.map(({ _id }) => _id);
        const sold = existGoal.map(({ sold }) => sold);

        const updatedGoal = await Goal.updateOne(
            { _id: id[0] },
            {
                goal: goalValue,
                proportional: proportionalWorkingDays(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    goalValue,
                ),
                dailyGoal:
                    (goalValue - sold[0]) /
                    getRemainingBusinessDays(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                    ),
            },
        );
        res.send(updatedGoal);
        return;
    }

    const totalGoal = new Goal({
        goal: goalValue,
        proportional: proportionalWorkingDays(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            req.body.goal,
        ),
        sold: 0,
        missingDays: getRemainingBusinessDays(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        ),
        dailyGoal:
            req.body.goal /
            getRemainingBusinessDays(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
            ),
    });

    try {
        await totalGoal.save();
        res.send("Meta criada com sucesso!");
    } catch (error) {
        res.send(error);
    }
};

const updateSold = async (req, res) => {
    const id = req.params.id;
    const newSold = req.body.sold;

    if (newSold === "" || newSold === 0) {
        return res
            .status(400)
            .send(`Não é possível adicionar uma venda com o valor ${newSold}`);
    }

    try {
        await Goal.updateOne({ _id: id }, { $inc: { sold: newSold } });

        const totalGoal = await Goal.find({ _id: id });
        const goal = totalGoal.map(({ goal }) => goal);
        const soldValue = totalGoal.map(({ sold }) => sold);

        updatedDaily(soldValue[0], goal[0], id);

        res.send("Venda adicionada com sucesso!");
    } catch (error) {
        res.send(error);
    }
};

const removeSold = async (req, res) => {
    const id = req.params.id;
    const soldValue = req.body.sold;

    if (soldValue === "" || soldValue === 0) {
        return res
            .status(400)
            .send(
                `Não é possível remover uma venda com o valor ${
                    soldValue === "" ? 0 : soldValue
                }`,
            );
    }

    const totalGoal = await Goal.find({});
    const goal = totalGoal.map(({ goal }) => goal);
    const filteredSold = totalGoal.map(({ sold }) => sold);
    const soldTotal = filteredSold[0] - soldValue;

    updatedDaily(soldTotal, goal, id);

    try {
        const sold = await Goal.updateOne(
            { _id: id },
            { $set: { sold: soldTotal } },
        );
        res.send(sold);
    } catch (error) {
        return res.status(404).send(error);
    }
};

const deleteGoal = async (req, res) => {
    const id = req.params.id;
    const totalGoal = await Goal.find({ _id: id });
    const _id = totalGoal.map(({ _id }) => _id);

    if (_id[0] != id) {
        return res.status(404).send("Ops, a sua meta não foi encontrada!");
    }

    try {
        await Goal.deleteOne({ _id: id });
        res.send("Meta apagada com sucesso");
    } catch (error) {
        return res.status(404).send(error);
    }
};

export { createGoal, updateSold, removeSold, deleteGoal };
