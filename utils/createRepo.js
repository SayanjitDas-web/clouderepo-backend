const axios = require('axios');

// Function to check if the repository already exists
const checkRepoExists = async (githubUsername, githubToken, repoName) => {
  const config = {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  };
  const checkUrl = `https://api.github.com/repos/${githubUsername}/${repoName}`;
  try {
    await axios.get(checkUrl, config);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw new Error(`Error checking repository: ${error.response ? error.response.data.message : error.message}`);
  }
};

// Function to create a new GitHub repository
const createRepo = async (githubUsername, githubToken, repoName, description, isPrivate) => {
  const config = {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  };
  const url = 'https://api.github.com/user/repos';
  const data = {
    name: repoName,
    description: description,
    private: isPrivate,
  };
  try {
    const response = await axios.post(url, data, config);
    return response.data.html_url;
  } catch (error) {
    throw new Error(`Error creating repository: ${error.response ? error.response.data.message : error.message}`);
  }
};

// Function to add a README.md file to the repository
const addReadme = async (githubUsername, githubToken, repoName, readmeContent) => {
  const config = {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  };
  const readmeUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/README.md`;
  const readmeData = {
    message: 'Add README.md',
    content: Buffer.from(readmeContent).toString('base64'),
  };
  try {
    await axios.put(readmeUrl, readmeData, config);
  } catch (error) {
    throw new Error(`Error adding README.md: ${error.response ? error.response.data.message : error.message}`);
  }
};

// Function to create or update a GitHub repository and upload images
const createRepoAndUploadImages = async (githubUsername, githubToken, repoName, description = '', isPrivate = false) => {
  const readmeContent = `# ${repoName}\n\n${description}`;

  try {
    const repoExists = await checkRepoExists(githubUsername, githubToken, repoName);
    if (repoExists) {
      console.log('Repository already exists:', repoName);
      return { success: true }; // Return early with success if repository already exists
    }

    const repoUrl = await createRepo(githubUsername, githubToken, repoName, description, isPrivate);
    console.log('Repository created successfully:', repoUrl);

    await addReadme(githubUsername, githubToken, repoName, readmeContent);

    console.log('README.md added successfully');
    return { success: true, repoUrl }; // Return success with repoUrl
  } catch (error) {
    console.error(error.message);
    return { success: false, error: error.message }; // Return failure with error message
  }
};

// Function to validate inputs and perform the requested operation
const createRepoToHost = async (githubToken, githubUsername, repoName, description, isPrivate) => {
  if (!githubToken || !githubUsername) {
    console.error('Please provide a GitHub token and username');
    process.exit(1);
  }

  if (!repoName) {
    console.error('Please provide a repository name');
    process.exit(1);
  }

  const result = await createRepoAndUploadImages(githubUsername, githubToken, repoName, description, isPrivate);

  if (result.success) {
    return { success: true };
  } else {
    throw new Error(`Failed to create repository: ${result.error}`);
  }
};

const deleteImageFromRepo = async (githubToken, githubUsername, repoName, fileName) => {
  try {
    // Configure Axios instance with GitHub API credentials
    const axiosInstance = axios.create({
      baseURL: `https://api.github.com/repos/${githubUsername}/${repoName}/contents/images`,
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    // Get the SHA of the file to delete
    const { data: fileData } = await axiosInstance.get(`/${fileName}`);
    const fileSha = fileData.sha;

    const deleteUrl = `/${fileName}`;
    const deleteData = {
      message: `Delete ${fileName}`,
      sha: fileSha,
    };

    try {
      await axiosInstance.delete(deleteUrl, { data: deleteData });
      console.log(`Deleted ${fileName} from ${repoName} repository`);
    } catch (error) {
      console.error(`Error deleting ${fileName}:`, error.response ? error.response.data : error.message);
    }

    console.log('Image deleted successfully.');

    return {success: true, fileName};
  } catch (error) {
    console.error('Error deleting file:', error.message);
    return { success: true, error: error.message }
  }
};

module.exports = { createRepoToHost, deleteImageFromRepo };
