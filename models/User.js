import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    phone: { type: String },
    location: { type: String },
    name: { type: String },
    avatar: { type: String },

    subscription: {
      plan: {
        type: String,
        enum: ["Basic", "Pro", "Premium","Free"],
        default: "Free",
      },
      status: {
        type: String,
        enum: ["inactive", "active"],
        default: "inactive",
      },
      videoLimit: { type: Number, default: 0 },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
