import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: "dfyrwejy2",
  api_key: "686887863967155",
  api_secret: "g4qRwMLl-qKe2eIuIcrYa2Enm1s",
});

export const uploadToCloudinary = async (filePath, folder = "afrovids") => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder,
  });
  return result.secure_url;
};

export const deleteFromCloudinary = async (fileUrl) => {
  const publicId = fileUrl.split("/").slice(-1)[0].split(".")[0]; // extract public ID
  await cloudinary.uploader.destroy(`afrovids/${publicId}`, {
    resource_type: "video",
  });
};
