const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import User from "../models/User";
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) {
      return res.send({
        message: "Name is Required",
      });
    }
    if (!email) {
      return res.send({
        message: "Email is Required",
      });
    }
    if (!password) {
      return res.send({
        message: "Password is Required",
      });
    }
    //Checking User---------------
    const userexist = await User.findOne({ email });
    if (userexist) {
      return res.status(200).send({
        success: false,
        message: "Please Login, You are already registered",
      });
    }
    //------------------------------------------------------
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { userId } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ error: "Invalid old password" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserData = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
