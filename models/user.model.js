const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { encrypt, decrypt } = require("../utils/encryption");

const secretKey = process.env.CRYPTO_SECRET_KEY;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"], // Email validation regex
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    githubUsername: {
      type: String,
      required: [true, "github username is required"],
      unique: true,
    },
    githubToken: {
      type: String,
      required: [true, "github token is required"],
      unique: true,
    },
    createdRepos:{
      type: Array,
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isModified("githubToken")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", function (next) {
  if (this.isModified("githubToken")) {
    try {
      this.githubToken = encrypt(this.githubToken, secretKey);
    } catch (error) {
      console.error("Encryption error:", error);
      return next(error);
    }
  }
  next();
});

userSchema.methods.getGithubToken = function () {
  try {
    return decrypt(this.githubToken, secretKey);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
