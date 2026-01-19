const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: true,
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
    },

    ipAddress: {
        type: String,
        trim: true,
        default: null,
    },

    location: {
        type: String,
        trim: true,
        default: null,
    },

    active: {
        type: Boolean,
        default: true,
    },

    lastLogin: {
        type: Date,
        default: null,
    },

    blocked: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

module.exports = userSchema; 
