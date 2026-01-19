const router = require('express').Router()
const User =require("../entity/UserModel");
const fs = require("fs");
const path = require("path");

router.get('/', async (req, res) => {
  try {
    const users = await User.find().limit(50).lean();
    res.status(200).json({items: users});
  } catch (err) {
      console.error("GET /users failed:", err);
      res.status(500).json({ message: "Internal server error" });
  }
})

router.post("/import", async (req, res) => {
    try {
        const filePath = "/app/user.csv";

        const fileContent = fs.readFileSync(filePath, "utf8");

        const lines = fileContent.split("\n");
        const header = lines.shift();

        let imported = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const[
                name,
                email,
                ipAddress,
                location,
                active,
                lastLogin,
            ] = line.split(",");

            await User.updateOne(
                {email: email.trim()},
                {
                    name: name?.trim(),
                    email: email?.trim(),
                    ipAddress: ipAddress?.trim() || null,
                    location: location?.trim() || null,
                    active: active === "true",
                    lastLogin: lastLogin ? new Date(lastLogin) : null,
                },
                {upsert: true}
            );
            imported++;
        }
        res.status(200).json({
            message: "CSV import successful",
            imported,
        });
    }catch(err) {
        console.error("CSV import failed:", err);
        res.status(500).json({message:"CSV import failed"});
    }

});
router.get('/:id', async (req, res) => {
  res.send("TODO User GET ID")

})

router.patch('/:id', async (req, res) => {
  res.send("TODO User PATCH id")

})

router.patch('/:id/block', async (req, res) => {
  try {
      const { id } = req.params;

      const updated = await User.findByIdAndUpdate(
          id,
          {blocked: true},
          {new: true, lean: true}
      );

      if (!updated) {
          return res.status(404).json({message:"User not found"});
      }

      return res.status(200).json({items: updated});
  } catch (err) {
      console.error("PATCH /users/:id/block failed", err);
      return res.status(500).json({message:"Internal server error"});
  }
})

router.patch('/:id/unblock', async (req, res) => {
  try{
      const { id } = req.params;

      const updated = await User.findByIdAndUpdate(
          id,
          {blocked: false},
          {new: true, lean: true}
      );

      if (!updated) {
          return res.status(404).json({message:"User not found"});
      }

      return res.status(200).json({items: updated});
  }catch(err) {
      console.error("PATCH /users/:id/unblock failed", err);
      return res.status(500).json({message:"Internal server error"});
  }
})

module.exports = router
