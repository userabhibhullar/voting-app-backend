const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("this is voting-app-backend");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
