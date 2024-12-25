import Goal from "../models/Goal.js";

const proportionalWorkingDays = (year, month, currentDay, goal) => {
    const today = new Date(year, month, currentDay);
    let lastDay = new Date(year, month + 1, 0);

    let proportional;
    let proportionalDays = [];

    for (let day = today; day <= lastDay; day.setDate(day.getDate() + 1)) {
        let dayOfTheWeek = day.getDay();
        if (dayOfTheWeek !== 0) proportionalDays.push(new Date(day));
    }

    proportionalDays.map((proportionalDay) => {
        if (currentDay === proportionalDay.getDate()) {
            proportional = (currentDay / lastDay.getDate()) * goal;
        }
    });

    return Math.round(proportional);
};

function getRemainingBusinessDays(year, month, currentDay) {
    const today = new Date(year, month, currentDay);
    let lastDay = new Date(year, month + 1, 0);
    const nationalHolidays = [
        new Date(year, "0", "1"),
        new Date(year, "1", "12"),
        new Date(year, "1", "13"),
        new Date(year, "2", "29"),
        new Date(year, "3", "21"),
        new Date(year, "4", "1"),
        new Date(year, "4", "30"),
        new Date(year, "8", "7"),
        new Date(year, "9", "12"),
        new Date(year, "10", "2"),
        new Date(year, "10", "15"),
        new Date(year, "11", "25"),
    ];

    let businessDaysRemaining = [];

    for (let day = today; day <= lastDay; day.setDate(day.getDate() + 1)) {
        let dayOfTheWeek = day.getDay();
        let isHoliday = nationalHolidays.some(
            (holiday) => holiday.getTime() === day.getTime(),
        );

        if (dayOfTheWeek !== 0 && !isHoliday) {
            businessDaysRemaining.push(new Date(day));
        }
    }

    return businessDaysRemaining.length;
}

const goalControllers = async (req, res) => {
    const date = new Date();
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
    const date = new Date();
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

        const updateDaily =
            (goal[0] - soldValue[0]) /
            getRemainingBusinessDays(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
            );

        if (soldValue[0] >= goal[0]) {
            await Goal.updateOne({ _id: id }, { dailyGoal: 0 });
            res.send("Venda adicionada com sucesso!");
            return;
        }

        await Goal.updateOne(
            { _id: id },
            { dailyGoal: parseFloat(updateDaily).toFixed(2) },
        );

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
    const filteredSold = totalGoal.map(({ sold }) => sold);
    const soldTotal = filteredSold[0] - soldValue;

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

export { goalControllers, updateSold, removeSold };
