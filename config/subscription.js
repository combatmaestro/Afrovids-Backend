
export const PLAN_CONFIG = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    price: 15.00,                                   
    videoLimit: 30,                              
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 25.00,
    videoLimit: 60,
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    price: 40.00,
    videoLimit: 120,
  },
};
