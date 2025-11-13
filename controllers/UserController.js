import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "ID Token missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const user = await User.findOne({ email: payload.email });

    if (!user) {
      const newUser = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
      });
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(201).json({ success: true, token });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedUser.id).select(
      "-googleId -__v"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
        success:true,
        user
    })
  } catch (error) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    const updateFileds = {};
    const allowedFields = ["name", "bio", "phone", "location", "avatar"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateFileds[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      decodedUser.id,
      updateFileds,
      {
        new: true,
        runValidators: true,
      }
    ).select("-googleId");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A user with that email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Could not update user.",
    });
  }
};
