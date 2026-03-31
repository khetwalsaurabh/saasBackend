// const multer = require("multer");

// const storage = multer.diskStorage({

//    destination: function (req, file, cb) {

//       cb(null, "uploads/logo");

//    },

//    filename: function (req, file, cb) {

//       cb(null, Date.now() + "-" + file.originalname);

//    }

// });

// const upload = multer({ storage });

// module.exports = upload;





const multer = require("multer");

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/logo");

  },

  filename: function (req, file, cb) {

    cb(null, Date.now() + "-" + file.originalname);

  }

});


const fileFilter = (req, file, cb) => {

   if (

      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"

   ) {

      cb(null, true);

   } else {

      cb(new Error("Only image allowed"), false);

   }

};


const upload = multer({
   storage,
   fileFilter
});


module.exports = upload;