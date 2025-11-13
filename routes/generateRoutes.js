import express from "express";
import { generateHandler } from "../controllers/generateController.js";

const router = express.Router();

// POST /api/generate
router.post("/", generateHandler);

export default router;
