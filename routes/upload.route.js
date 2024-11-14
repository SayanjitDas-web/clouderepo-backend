const express = require("express");
const router = express.Router();
const { imageUpload, jobStatus, deleteImage } = require("../controllers/upload.conroller");
const { uploadFile } = require("../middlewares/multer.middleware");

router.route("/upload").post(uploadFile.single("image"), imageUpload);

router.route("/job-status/:jobId").get(jobStatus);

router.route("/deleteFile").post(deleteImage);

module.exports = router;