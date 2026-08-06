const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
}, { timestamps: true });

todoSchema.index({ userId: 1, createdAt: -1 });

const Todo = mongoose.model("todo", todoSchema);
module.exports = Todo;
