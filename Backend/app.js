const express = require("express");
const cors = require("cors");

/**
 * ============================================================
 * EXPRESS APPLICATION SETUP
 *
 * This file configures the Express application instance.
 * It does NOT start the server or connect to the database.
 * The app is exported so it can be reused for testing.
 * ============================================================
 */

const app = express();

/**
 * Parse incoming JSON request bodies.
 * The high limit allows large payloads (e.g. CSV-related data).
 */
app.use(express.json({ limit: "100mb" }));

/**
 * Enable Cross-Origin Resource Sharing (CORS).
 * This allows the frontend (running on a different port)
 * to communicate with the backend API.
 */
app.use(
    cors({
        origin: "*", // Allow requests from any origin (development setup)
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: "*",
        exposedHeaders: [
            "Location",
            "Content-Type",
            "Content-Description",
            "Content-Disposition",
            "Expires",
            "Cache-Control",
            "Pragma",
            "Content-Length",
            "Content-Range",
            "Max-Parts",
            "File-Part",
            "Temp-Name",
        ],
        credentials: true,
    })
);

/**
 * Register user-related API routes.
 * All user endpoints are available under /v1/users.
 */
const userRoute = require("./service/routes/user");
app.use("/v1/users", userRoute);

/**
 * Export the configured Express app.
 * The actual server startup happens in index.js.
 * This separation makes the app testable with Jest/Supertest.
 */
module.exports = app;
