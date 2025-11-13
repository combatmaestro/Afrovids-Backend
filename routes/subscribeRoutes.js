import { Router } from "express";
import isProtected from "../middlewares/authMiddleware.js";
import { confirmSubscription, subcribe } from "../controllers/SubscriptionController.js";

const router = Router();

router.post("/create-checkout-session",isProtected,subcribe)
router.post("/confirm-subscription", isProtected, confirmSubscription);


export default router;
