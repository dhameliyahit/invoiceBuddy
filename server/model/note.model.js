const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    color: { type: String, default: "#ffffff" },
}, { timestamps: true });

noteSchema.index({ userId: 1, createdAt: -1 });

const Note = mongoose.model("note", noteSchema);
module.exports = Note;
