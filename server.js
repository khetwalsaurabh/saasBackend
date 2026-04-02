require('dotenv').config()
const express = require("express");
const cors = require("cors");
const router = require("./router/router.js");



const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("/var/www/uploads"));

require("./model/config.js");

app.use("/api", router);

app.listen(port, (err) => {
  if (err) {
    console.log("Server error");
  } else {
    console.log(`Server connected successfully on port ${port}`);
  }
});
