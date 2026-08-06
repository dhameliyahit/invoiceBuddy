const noteModel = require("../model/note.model.js");
const todoModel = require("../model/todo.model.js");
const goalModel = require("../model/goal.model.js");
const incomeModel = require("../model/income.model.js");

// ==================== NOTES ====================

exports.getNotes = async (req, res) => {
    try {
        const notes = await noteModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notes });
    } catch (error) {
        console.error("Get Notes Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch notes" });
    }
};

exports.createNote = async (req, res) => {
    try {
        const { title, content, color } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        const note = await noteModel.create({
            userId: req.user._id,
            title,
            content: content || "",
            color: color || "#ffffff",
        });
        res.status(201).json({ success: true, note });
    } catch (error) {
        console.error("Create Note Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create note" });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, color } = req.body;
        const note = await noteModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { title, content, color },
            { new: true }
        );
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        res.status(200).json({ success: true, note });
    } catch (error) {
        console.error("Update Note Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update note" });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await noteModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        res.status(200).json({ success: true, message: "Note deleted" });
    } catch (error) {
        console.error("Delete Note Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete note" });
    }
};

// ==================== TODOS ====================

exports.getTodos = async (req, res) => {
    try {
        const todos = await todoModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, todos });
    } catch (error) {
        console.error("Get Todos Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch todos" });
    }
};

exports.createTodo = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        const todo = await todoModel.create({
            userId: req.user._id,
            title,
            description: description || "",
            priority: priority || "medium",
            dueDate: dueDate || null,
        });
        res.status(201).json({ success: true, todo });
    } catch (error) {
        console.error("Create Todo Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create todo" });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, dueDate, completed } = req.body;
        const todo = await todoModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { title, description, priority, dueDate, completed },
            { new: true }
        );
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        res.status(200).json({ success: true, todo });
    } catch (error) {
        console.error("Update Todo Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update todo" });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const todo = await todoModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        res.status(200).json({ success: true, message: "Todo deleted" });
    } catch (error) {
        console.error("Delete Todo Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete todo" });
    }
};

// ==================== GOALS ====================

exports.getGoals = async (req, res) => {
    try {
        const goals = await goalModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        console.error("Get Goals Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch goals" });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const { title, description, targetDate, progress, status } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        const goal = await goalModel.create({
            userId: req.user._id,
            title,
            description: description || "",
            targetDate: targetDate || null,
            progress: progress || 0,
            status: status || "active",
        });
        res.status(201).json({ success: true, goal });
    } catch (error) {
        console.error("Create Goal Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create goal" });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, targetDate, progress, status } = req.body;
        const goal = await goalModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { title, description, targetDate, progress, status },
            { new: true }
        );
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }
        res.status(200).json({ success: true, goal });
    } catch (error) {
        console.error("Update Goal Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update goal" });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await goalModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }
        res.status(200).json({ success: true, message: "Goal deleted" });
    } catch (error) {
        console.error("Delete Goal Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete goal" });
    }
};

// ==================== INCOME ====================

exports.getIncomes = async (req, res) => {
    try {
        const incomes = await incomeModel.find({ userId: req.user._id }).sort({ date: -1 });
        res.status(200).json({ success: true, incomes });
    } catch (error) {
        console.error("Get Incomes Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch incomes" });
    }
};

exports.createIncome = async (req, res) => {
    try {
        const { amount, category, note, date } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount is required" });
        }
        const income = await incomeModel.create({
            userId: req.user._id,
            amount,
            category: category || "General",
            note: note || "",
            date: date || Date.now(),
        });
        res.status(201).json({ success: true, income });
    } catch (error) {
        console.error("Create Income Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create income entry" });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const income = await incomeModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!income) {
            return res.status(404).json({ success: false, message: "Income entry not found" });
        }
        res.status(200).json({ success: true, message: "Income entry deleted" });
    } catch (error) {
        console.error("Delete Income Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete income entry" });
    }
};

// ==================== SUMMARY ====================

exports.getProductivitySummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const [totalNotes, pendingTodos, completedTodos, activeGoals, completedGoals, incomeStats] = await Promise.all([
            noteModel.countDocuments({ userId }),
            todoModel.countDocuments({ userId, completed: false }),
            todoModel.countDocuments({ userId, completed: true }),
            goalModel.countDocuments({ userId, status: "active" }),
            goalModel.countDocuments({ userId, status: "completed" }),
            incomeModel.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]),
        ]);

        res.status(200).json({
            success: true,
            summary: {
                totalNotes,
                pendingTodos,
                completedTodos,
                activeGoals,
                completedGoals,
                totalIncome: incomeStats.length > 0 ? incomeStats[0].total : 0,
                totalIncomeEntries: incomeStats.length > 0 ? incomeStats[0].count : 0,
            },
        });
    } catch (error) {
        console.error("Summary Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch summary" });
    }
};
