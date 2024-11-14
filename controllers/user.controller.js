const { User } = require("../models/user.model");

exports.registerUser = async (req, res) => {
  const { username, email, password, githubUsername, githubToken } = req.body;

  try {
    const user = await User.create({ username, email, password, githubUsername, githubToken });
    res
      .status(200)
      .json({ success: true, message: "User registered successfully!", user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide email and password!" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found!" });
    }

    const isMatched = await user.matchPassword(password);

    if (!isMatched) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials!" });
    }

    // Remove password before sending the response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
