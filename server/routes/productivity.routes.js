const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const {
    getNotes, createNote, updateNote, deleteNote,
    getTodos, createTodo, updateTodo, deleteTodo,
    getGoals, createGoal, updateGoal, deleteGoal,
    getIncomes, createIncome, deleteIncome,
    getProductivitySummary,
} = require("../controller/productivity.controller.js");

const router = express.Router();

// Notes
router.get("/notes", userAuth, getNotes);
router.post("/notes", userAuth, createNote);
router.put("/notes/:id", userAuth, updateNote);
router.delete("/notes/:id", userAuth, deleteNote);

// Todos
router.get("/todos", userAuth, getTodos);
router.post("/todos", userAuth, createTodo);
router.put("/todos/:id", userAuth, updateTodo);
router.delete("/todos/:id", userAuth, deleteTodo);

// Goals
router.get("/goals", userAuth, getGoals);
router.post("/goals", userAuth, createGoal);
router.put("/goals/:id", userAuth, updateGoal);
router.delete("/goals/:id", userAuth, deleteGoal);

// Income
router.get("/incomes", userAuth, getIncomes);
router.post("/incomes", userAuth, createIncome);
router.delete("/incomes/:id", userAuth, deleteIncome);

// Summary
router.get("/summary", userAuth, getProductivitySummary);

module.exports = router;
