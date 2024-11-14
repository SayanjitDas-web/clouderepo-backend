const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Function to upload a single image to a GitHub repository
const uploadImageToRepo = async (githubToken, githubUsername, repoName, filePath) => {
  try {
    const fileContent = await fs.readFile(filePath);
    const contentEncoded = Buffer.from(fileContent).toString('base64');
    const fileName = path.basename(filePath);

    // Configure Axios instance with GitHub API credentials
    const axiosInstance = axios.create({
      baseURL: `https://api.github.com/repos/${githubUsername}/${repoName}/contents/images`,
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const uploadUrl = `/${fileName}`;
    const uploadData = {
      message: `Add ${fileName}`,
      content: contentEncoded,
    };

    try {
      await axiosInstance.put(uploadUrl, uploadData);
      console.log(`Uploaded ${fileName} to ${repoName} repository`);
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error.response ? error.response.data : error.message);
    }

    console.log('Image uploaded successfully.');

    return fileName;
  } catch (error) {
    console.error('Error reading file:', error.message);
  }
};

// Example usage
// uploadImageToRepo(githubToken, githubUsername, repoName, '/path/to/your/image.jpg');

module.exports = { uploadImageToRepo };
