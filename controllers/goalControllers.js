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

    const totalGoal = new Goal({
        goal: req.body.goal,
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
        res.send(totalGoal);
    } catch (error) {}
};

const updateSold = async (req, res) => {
    const date = new Date();
    const id = req.params.id;
    const newSold = req.body.sold;

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

        await Goal.updateOne(
            { _id: id },
            { dailyGoal: parseFloat(updateDaily).toFixed(2) },
        );
        res.send("Venda adicionada!");
    } catch (error) {
        console.log(error);
    }
};

export { goalControllers, updateSold };
