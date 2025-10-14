const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null,
    },
    businessName: {
        type: String,
        default: null,
    },
    businessAddress: {
        type: String,
        default: null,
    },
    businessPhone: {
        type: String,
        default: null,
    },
    businessEmail: {
        type: String,
        default: null,
    },
    waterMark: {
        type: String,
        default: null,
    },
    endMessage: {
        type: String,
        default: null,
    },
    logo: {
        type: String,
        default: null,
    },
    isRegistered: {
        type: Boolean,
        default: false,
    }
    // customers: [
    //     {type: mongoose.Schema.Types.ObjectId, ref: 'customer' }
    // ]
}, {
    timestamps: true,
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;