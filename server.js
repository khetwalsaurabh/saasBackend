// require('dotenv').config()
// const express = require("express");
// const cors = require("cors");
// const router = require("./router/router.js");
// const { UPLOAD_ROOT } = require("./Multer/upload");  // ← import shared constant



// const app = express();
// const port = process.env.PORT;

// app.use(cors());
// app.use(express.json());
// // app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static("/var/www/uploads"));

// require("./model/config.js");

// app.use("/api", router);

// app.listen(port, (err) => {
//   if (err) {
//     console.log("Server error");
//   } else {
//     console.log(`Server connected successfully on port ${port}`);
//   }
// });

require("dotenv").config()
const express = require("express");
const cors    = require("cors");
const router  = require("./router/router.js");
const { UPLOAD_ROOT } = require("./Multer/upload");  // ← import shared constant

require("./model/config.js");

const app  = express();
const port = process.env.PORT;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Set ALLOWED_ORIGINS in each environment's .env (comma-separated)
// Local:   ALLOWED_ORIGINS=http://localhost:5173
// VPS dev: ALLOWED_ORIGINS=https://dev.wisemanagehq.com
// VPS prod:ALLOWED_ORIGINS=https://wisemanagehq.com,https://dev.wisemanagehq.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server calls (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static uploads ───────────────────────────────────────────────────────────
// UPLOAD_ROOT is resolved dynamically from env, so this works on
// both Windows (./uploads) and Linux VPS (/var/www/uploads).
// A file saved at  <UPLOAD_ROOT>/logo/abc.png
// is served at     https://yourdomain.com/uploads/logo/abc.png
app.use("/uploads", express.static(UPLOAD_ROOT));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(port, (err) => {
  if (err) {
    console.log("Server error:", err);
  } else {
    console.log(`Server connected successfully on port ${port}`);
    console.log(`Uploads served from: ${UPLOAD_ROOT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  }
});