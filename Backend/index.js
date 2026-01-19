const mongoose = require("mongoose");
const app = require("./app");

const MONGO_URL = process.env.MONGO_URI || "mongodb://mongo-user:27017/userdb";
const PORT = process.env.PORT || 3000;

mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => {
        console.log("Backend running on Port " + PORT);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error", err);
      process.exit(1);
    });
