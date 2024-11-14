const { User } = require("../models/user.model");
const { addToQueue, imageUploadQueue } = require("../queue/producer.js");
const { deleteImageFromRepo } = require("../utils/createRepo.js")

exports.imageUpload = async (req, res) => {
  const { githubUsername, repoName } = req.body;

  // Get the file path from multer
  const filePath = req.file.path;

  if (!githubUsername || !repoName) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Please provide github username and repository name!",
      });
  }

  const user = await User.findOne({ githubUsername });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found!" });
  }

  const githubToken = user.getGithubToken()
  const description = `this repository belongs to ${user.username}`;

  const jobId = await addToQueue(
    githubToken,
    githubUsername,
    filePath,
    repoName,
    description
  );

  return res.status(200).json({ success: true, jobId });
};

exports.jobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = await imageUploadQueue.getJob(jobId);

  if (!job) {
    return res.status(404).json({ success: false, message: "job not found!" });
  }

  const state = await job.getState();
  const progress = job.progress;
  const result = job.returnvalue;
  const failedReson = job.failedReason;

  return res
    .status(200)
    .json({ success: true, state, progress, result, failedReson });
};

exports.deleteImage = async (req, res) => {
  const { githubUsername, repoName, fileName } = req.body

  if (!githubUsername || !repoName || !fileName) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Please provide github username, repository name and file name!",
      });
  }

  const user = await User.findOne({ githubUsername });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found!" });
  }

  const githubToken = user.getGithubToken()

  const result = await deleteImageFromRepo(githubToken, githubUsername, repoName, fileName)

  if(result.success){
    return res.status(200).json({ success: true, message: "file deleted successfully!" });
  }
  else{
    return res.status(400).json({ success: false, error: result.error });
  }
}