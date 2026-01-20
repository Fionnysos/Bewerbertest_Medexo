const mongoose = require("mongoose");
const app = require("./app");

/**
 * ============================================================
 * APPLICATION ENTRY POINT
 *
 * This file is responsible for:
 * - connecting to MongoDB
 * - starting the HTTP server
 *
 * It does NOT configure routes or middleware.
 * ============================================================
 */

// MongoDB connection string
// Uses environment variable if available, otherwise fallback for local Docker setup
const MONGO_URL = process.env.MONGO_URI || "mongodb://mongo-user:27017/userdb";

// HTTP port for the backend server
const PORT = process.env.PORT || 3000;

/**
 * Connect to MongoDB using Mongoose.
 * The server is started ONLY after a successful DB connection.
 */
mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log("MongoDB connected");

        // Start the HTTP server after DB connection is established
        app.listen(PORT, () => {
            console.log("Backend running on Port " + PORT);
        });
    })
    .catch((err) => {
        // If the database connection fails, exit the process
        console.error("MongoDB connection error", err);
        process.exit(1);
    });
