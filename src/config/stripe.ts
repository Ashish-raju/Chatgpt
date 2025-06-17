export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_default",
  merchantIdentifier: "merchant.com.riderseeker.app",
  urlScheme: "rider-seeker",
  currency: "usd",
  defaultPaymentAmount: 1500, // $15.00 in cents
};

export const PAYMENT_CONFIG = {
  minAmount: 500, // $5.00 minimum
  maxAmount: 10000, // $100.00 maximum
  defaultTip: 200, // $2.00 default tip
  processingFee: 30, // $0.30 processing fee
};
