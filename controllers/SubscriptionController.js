import Stripe from "stripe";
import { PLAN_CONFIG } from "../config/subscription.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const subcribe = async (req, res) => {
  try {
    const { plan } = req.body;
  
    const config = PLAN_CONFIG[plan];
    if (!config) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan selected" });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: config.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: req.user.email,
    });
  
    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};

export const confirmSubscription = async (req, res) => {
  try {
    const { session_id, plan } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
    const config = PLAN_CONFIG[plan];
    await User.findByIdAndUpdate(req.user.id, {
      subscription: {
        plan,
        stripeSubscriptionId: session.subscription,
        videoLimit: config.videoLimit,
        status: "active",
      },
    });

    res.json({ success: true, message: "Subscription activated successfully" });
  } catch (err) {
    console.error("Confirm error:", err);
    res.status(500).json({ success: false, message: "Failed to confirm subscription" });
  }
};
