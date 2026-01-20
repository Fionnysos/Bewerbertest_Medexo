const mongoose = require("mongoose");

// This schema defines the structure of a User document in MongoDB.
// It describes which fields exist, their types, and basic validation rules.
const userSchema = new mongoose.Schema(
    {
        // Full name of the user
        name: {
            type: String,
            trim: true,
            required: true, // must be provided when creating a user
        },

        // Email address (used as unique identifier)
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            unique: true, // ensures no duplicate users by email
        },

        // IP address of the user
        ipAddress: {
            type: String,
            trim: true,
            default: null,
        },

        // Location (city)
        location: {
            type: String,
            trim: true,
            default: null,
        },

        // Indicates whether the user is active
        active: {
            type: Boolean,
            default: true,
        },

        // Timestamp of the last login
        lastLogin: {
            type: Date,
            default: null,
        },

        // Indicates whether the user is blocked
        blocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        // Automatically adds createdAt and updatedAt timestamps
        timestamps: true,
    }
);

// Export only the schema (not the model)
module.exports = userSchema;
