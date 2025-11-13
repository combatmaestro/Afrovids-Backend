import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";

// Route imports
import userRoutes from "./routes/userRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://afro-vids.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());

// Mount routes
app.use("/api/auth", userRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/generate", generateRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AfroVids API is running 🚀" });
});

export default app;
