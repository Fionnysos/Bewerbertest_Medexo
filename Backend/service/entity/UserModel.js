const mongoose = require("mongoose");
const userSchema = require("./User");

// Reuse model if it already exists
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
