const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    targetDate: { type: Date, default: null },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
}, { timestamps: true });

goalSchema.index({ userId: 1, createdAt: -1 });

const Goal = mongoose.model("goal", goalSchema);
module.exports = Goal;
