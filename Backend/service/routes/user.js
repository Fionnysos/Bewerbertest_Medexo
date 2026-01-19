const router = require("express").Router();
const User = require("../entity/UserModel");
const fs = require("fs");
const path = require("path");

// 1) LIST users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().limit(50).lean();
        return res.status(200).json({ items: users });
    } catch (err) {
        console.error("GET /users failed:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 2) CREATE user
router.post("/", async (req, res) => {
    try {
        const userData = req.body;
        const createdUser = await User.create(userData);
        return res.status(201).json({ item: createdUser });
    } catch (err) {
        console.error("POST /users failed:", err);
        return res.status(400).json({ message: "User creation failed" });
    }
});

// 3) IMPORT csv
router.post("/import", async (req, res) => {
    try {
        const filePath = "/app/user.csv";
        const fileContent = fs.readFileSync(filePath, "utf8");

        const lines = fileContent.split(/\r?\n/);
        lines.shift();

        let imported = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const [name, email, ipAddress, location, active, lastLogin] =
                line.split(",");

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

        return res.status(200).json({ message: "CSV import successful", imported });
    } catch (err) {
        console.error("CSV import failed:", err);
        return res.status(500).json({ message: "CSV import failed" });
    }
});

// 4) UPDATE user
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true, lean: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ item: updatedUser });
    } catch (err) {
        console.error("PATCH /users/:id failed:", err);
        return res.status(400).json({ message: "User update failed" });
    }
});

// 5) BLOCK
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

// 6) UNBLOCK
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
