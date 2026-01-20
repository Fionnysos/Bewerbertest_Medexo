const mongoose = require("mongoose");
const userSchema = require("./User");

// Create or reuse the User model.
// This prevents model overwrite errors when using hot reload (e.g. nodemon).
// If the model already exists, reuse it. Otherwise, create a new one.
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
