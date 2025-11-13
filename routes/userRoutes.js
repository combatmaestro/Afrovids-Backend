import { Router } from "express";
import { getUserById, googleAuth, updateUser } from "../controllers/UserController.js";
import isProtected from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/google", googleAuth);
router.put("/updateUser",isProtected, updateUser)
router.get("/getUser",isProtected, getUserById);

export default router;
