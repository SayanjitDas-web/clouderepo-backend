const { Queue } = require("bullmq");
const redisConnection = require("../config/redis-connection.js");

const imageUploadQueue = new Queue("image upload", {
  connection: redisConnection,
});

async function addToQueue(
  githubToken,
  githubUsername,
  filePath,
  repoName,
  description
) {
  const res = await imageUploadQueue.add("uploader", {
    githubToken,
    githubUsername,
    filePath,
    repoName,
    description,
    isPrivate: false,
  });
  return res.id;
}

module.exports = { addToQueue, imageUploadQueue };
