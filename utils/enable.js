const axios = require('axios');

// Fetch the GitHub token from the environment variables
// const githubToken = process.env.GITHUB_TOKEN;

// Function to enable GitHub Pages for a repository
const enableGitHubPages = async (repoOwner, repoName, githubToken) => {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/pages`;

  const config = {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  const data = {
    source: {
      branch: 'main', // Specify the branch to use for GitHub Pages
      path: '/', // Specify the directory where images are stored in your repository
    },
  };

  try {
    const response = await axios.post(url, data, config);
    console.log('GitHub Pages enabled successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error enabling GitHub Pages:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Example usage:
const repoOwner = 'SayanjitDas-web'; // Replace with your GitHub username or organization name
const repoName = 'my-new-repo1'; // Replace with your repository name

module.exports = { enableGitHubPages }