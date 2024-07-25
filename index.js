const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const polls = require("./routes/polls");

app.use(cors());
app.use(express.json());
app.use("/api/polls", polls);

require("dotenv").config();

app.get("/", (req, res) => {
  res.send("this is voting-app-backend");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const DATABASE_URL = process.env.DATABASE_STRING;

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Connected to mongoose database.");
  })
  .catch((error) => {
    console.log("Failed to connect to mongoose database.", error.message);
  });
