// const multer = require("multer");

// const storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//       // cb(null, "uploads/logo"); // yha bhi path change cb(null, "/var/www/uploads/logo");
//       // cb(null, "/var/www/uploads/logo");
//    },
//    // filename: function (req, file, cb) {
//    //    cb(null, Date.now() + "-" + file.originalname);
//    // }

//      filename: function (req, file, cb) {
//      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
//    }

// });

// const fileFilter = (req, file, cb) => {
//    if (
//       file.mimetype === "image/png" ||
//       file.mimetype === "image/jpeg" ||
//       file.mimetype === "image/jpg"
//    ) {
//       cb(null, true);
//    } else {
//       cb(new Error("Only image allowed"), false);
//    }
// };

// const upload = multer({
//    storage,
//    fileFilter
// });


// module.exports = upload;




// ==========================================================================


const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ─── Upload root: env var wins, fallback to project-local folder ──────────────
// Local Windows dev  → ./uploads  (relative to backend root)
// Linux VPS          → /var/www/uploads  (set in VPS .env)
const UPLOAD_ROOT = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)          // absolute if given
  : path.join(__dirname, "..", "uploads");          // relative fallback

// ─── Auto-create subdirectories so ENOENT never happens ──────────────────────
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Log resolved path on startup so you always know what's being used
console.log("[Multer] Upload root:", UPLOAD_ROOT);

// ─── Storage engine ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(UPLOAD_ROOT, "logo");
    ensureDir(dest);          // creates /uploads/logo if missing
    cb(null, dest);           // ← THIS WAS MISSING (empty callback = 500 error)
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

// ─── File type filter ─────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG / JPG / JPEG images are allowed"), false);
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB hard cap
});

// Export both so server.js can use UPLOAD_ROOT for express.static
module.exports = { upload, UPLOAD_ROOT };