const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "General" },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

incomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model("income", incomeSchema);
module.exports = Income;
