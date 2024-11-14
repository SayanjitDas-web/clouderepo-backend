const multer = require("multer");
const path = require("path")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "upload/images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const maxSize = 10 * 1024 * 1024;

const uploadFile = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    let filetypes = /jpeg|jpg|png/;
    let mimetype = filetypes.test(file.mimetype);

    let extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
        "following filetypes - " +
        filetypes
    );
  },
});

module.exports = { uploadFile }