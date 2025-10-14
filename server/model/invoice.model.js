const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    customer: {
        name: String,
        email: String,
        contactNo: String,
        whatsappNo: String,
        companyName: String,
        address: String,
    },

    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            unitPrice: { type: Number, default: 0 },
            creditAmount: { type: Number, default: 0 },
            debitAmount: { type: Number, default: 0 },
            tax: { type: Number, default: 0 },
            taxAmount: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        }
    ],

    grandSubtotal: { type: Number, default: 0 },
    grandTaxAmount: { type: Number, default: 0 },
    grandCreditAmount: { type: Number, default: 0 },
    grandDebitAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, enum: ["draft", "sent", "paid", "overdue"], default: "draft" },
    currency: { type: String, default: "INR" },
    invoicePdf: { type: String, default: null }

}, { timestamps: true });

// indexing for scalability
invoiceSchema.index({ userId: 1, invoiceDate: -1 });

const Invoice = mongoose.model("invoice", invoiceSchema);
module.exports = Invoice;
