const express = require("express")
const app = express()
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URI || "mongodb://mongo-user:27017/userdb";

mongoose
    .connect(MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection error", err);
      process.exit(1);
    });

app.use(express.json({ limit: "100mb" }))

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  exposedHeaders: [
    'Location',
    'Content-Type',
    'Content-Description',
    'Content-Disposition',
    'Expires',
    'Cache-Control',
    'Pragma',
    'Content-Length',
    'Content-Range',
    'Max-Parts',
    'File-Part',
    'Temp-Name'
  ],
  credentials: true,
}))

const userRoute = require("./service/routes/user")
app.use("/v1/users", userRoute)

app.listen(3000, () => {
  console.log("Backend running on Port " + 3000);
});