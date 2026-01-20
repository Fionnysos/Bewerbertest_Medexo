const router = require("express").Router();
const User = require("../entity/UserModel");
const fs = require("fs");

// request-level validation (Joi)
const { userValidation } = require("../validation/userValidation");

/**
 * ============================================================
 * USER ROUTES
 * This file defines all HTTP endpoints related to users.
 * It acts as the API layer between frontend and database.
 * ============================================================
 */

/**
 * 1) GET /v1/users
 * Returns a list of users.
 * Used by the frontend to display the user table.
 */
router.get("/", async (req, res) => {
    try {
        const limitRaw = req.query.limit;
        const limit = limitRaw
            ? Math.max(1, Math.min(parseInt(limitRaw, 10), 5000))
            : null;

        // Build database query
        const query = User.find().lean();
        if (limit) query.limit(limit);

        const users = await query;

        return res.status(200).json({ items: users });
    } catch (err) {
        console.error("GET /users failed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * 2) POST /v1/users
 * Creates a new user.
 */
router.post("/", async (req, res) => {
    // Validate request body before accessing the database
    const errors = userValidation(req.body, true); // true = create validation
    if (errors) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
        const createdUser = await User.create(req.body);
        return res.status(201).json({ item: createdUser });
    } catch (err) {
        // Example errors: duplicate email, schema validation error
        console.error("POST /users failed:", err);
        return res.status(400).json({ message: "User creation failed" });
    }
});

/**
 * 3) POST /v1/users/import
 * Imports users from a CSV file inside the container.
 */
router.post("/import", async (req, res) => {
    try {
        // CSV file is mounted into the container via docker-compose
        const filePath = "/app/user.csv";
        const fileContent = fs.readFileSync(filePath, "utf8");

        // Split file into lines (handles Windows + Unix line breaks)
        const lines = fileContent.split(/\r?\n/);
        lines.shift(); // Remove CSV header

        let imported = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const [name, email, ipAddress, location, active, lastLogin] =
                line.split(",");

            // Skip invalid rows
            if (!email || !email.trim()) continue;

            // Upsert = update existing user or create new one
            await User.updateOne(
                { email: email.trim() },
                {
                    name: name?.trim(),
                    email: email?.trim(),
                    ipAddress: ipAddress?.trim() || null,
                    location: location?.trim() || null,
                    active: active?.trim() === "true",
                    lastLogin: lastLogin ? new Date(lastLogin.trim()) : null,
                },
                { upsert: true }
            );

            imported++;
        }

        return res.status(200).json({
            message: "CSV import successful",
            imported,
        });
    } catch (err) {
        console.error("CSV import failed:", err);
        return res.status(500).json({ message: "CSV import failed" });
    }
});

/**
 * 4) PATCH /v1/users/:id
 * Updates an existing user.
 */
router.patch("/:id", async (req, res) => {
    // Validate request body (partial update)
    const errors = userValidation(req.body, false); // false = patch validation
    if (errors) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,             // return updated document
            runValidators: true,   // apply mongoose schema validation
            lean: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ item: updatedUser });
    } catch (err) {
        console.error("PATCH /users/:id failed:", err);
        return res.status(400).json({ message: "User update failed" });
    }
});

/**
 * 5) PATCH /v1/users/:id/block
 * Blocks a user (sets blocked = true).
 */
router.patch("/:id/block", async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await User.findByIdAndUpdate(
            id,
            { blocked: true },
            { new: true, lean: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ item: updated });
    } catch (err) {
        console.error("PATCH /users/:id/block failed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * 6) PATCH /v1/users/:id/unblock
 * Unblocks a user (sets blocked = false).
 */
router.patch("/:id/unblock", async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await User.findByIdAndUpdate(
            id,
            { blocked: false },
            { new: true, lean: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ item: updated });
    } catch (err) {
        console.error("PATCH /users/:id/unblock failed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
