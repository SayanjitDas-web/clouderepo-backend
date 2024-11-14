const { Worker } = require("bullmq");
const { User } = require("../models/user.model.js");
const redisConnection = require("../config/redis-connection.js");
const { createRepoToHost } = require("../utils/createRepo.js");
const { enableGitHubPages } = require("../utils/enable.js");
const { uploadImageToRepo } = require("../utils/uploadImages.js");
const fs = require("fs");

const worker = new Worker(
  "image upload",
  async (job) => {
    try {
      if (!job) {
        throw new Error("Job data is missing");
      }

      console.log(`Message received ID: ${job.id}`);
      console.log(`Processing message...`);

      // Find user by githubUsername
      const user = await User.findOne({
        githubUsername: job.data.githubUsername,
      });

      if (!user) {
        throw new Error(`User not found with GitHub username ${job.data.githubUsername}`);
      }

      // Check if the user has already created the repo
      const hasRepo = user.createdRepos.includes(job.data.repoName);

      if (!hasRepo) {
        // Create repository if not already created
        const result = await createRepoToHost(
          job.data.githubToken,
          job.data.githubUsername,
          job.data.repoName,
          job.data.description,
          job.data.isPrivate
        );

        // Handle result from createRepoToHost properly
        if (!result || !result.success) {
          throw new Error('Failed to create repository');
        }

        // Update user's createdRepos array
        await User.updateOne(
          { githubUsername: job.data.githubUsername },
          { $push: { createdRepos: job.data.repoName } }
        );

        // Enable GitHub Pages if repository creation was successful
        await enableGitHubPages(
          job.data.githubUsername,
          job.data.repoName,
          job.data.githubToken
        );
      }

      // Upload image to the repository
      const fileName = await uploadImageToRepo(
        job.data.githubToken,
        job.data.githubUsername,
        job.data.repoName,
        job.data.filePath
      );

      // Update job progress
      job.updateProgress(50);

      // Delete uploaded file
      fs.unlinkSync(job.data.filePath);

      // Update job progress
      job.updateProgress(100);

      // Construct and return image URL
      const imageUrl = `https://${job.data.githubUsername}.github.io/${job.data.repoName}/images/${fileName}`;
      return imageUrl;
    } catch (error) {
      console.error('Error processing job:', error);
      throw error; // Ensure the error is propagated to BullMQ for proper handling
    }
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", (job, result) => {
  console.log(`Job completed with result: ${result}`);
});

worker.on("failed", (job, error) => {
  console.log(`Job failed with error: ${error.message}`);
});

module.exports = worker;
