import express from 'express';
import Payment from '../models/payment.js';

const router = express.Router();

// POST /api/payment/create - Create PayPal payment

// POST /api/payment/create - Initiate payment for selected provider
router.post('/create', async (req, res) => {
  const { provider, plan, userId } = req.body;
  let paymentDetails = {};

  try {
    if (provider === 'paypal') {
      // TODO: Integrate PayPal API
      // Example: create PayPal order and return approval URL
      paymentDetails = { approvalUrl: 'https://paypal.com/checkout?token=EXAMPLE' };
    } else if (provider === 'razorpay') {
      // TODO: Integrate Razorpay API
      // Example: create Razorpay order and return orderId
      paymentDetails = { orderId: 'razorpay_order_EXAMPLE' };
    } else if (provider === 'stripe') {
      // TODO: Integrate Stripe API
      // Example: create Stripe session and return sessionId
      paymentDetails = { sessionId: 'stripe_session_EXAMPLE' };
    } else {
      return res.status(400).json({ error: 'Unsupported payment provider' });
    }

    // Save payment record (pending)
    await Payment.create({
      user: userId,
      amount: plan === 'hour' ? 2 : plan === 'day' ? 10 : 50,
      currency: 'USD',
      plan,
      status: 'pending',
      transactionId: paymentDetails.orderId || paymentDetails.sessionId || paymentDetails.approvalUrl
    });

    res.json({ success: true, provider, plan, paymentDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify - Verify payment and activate subscription

// POST /api/payment/verify - Verify payment and activate subscription
router.post('/verify', async (req, res) => {
  const { provider, transactionId, userId, plan } = req.body;
  let verified = false;

  try {
    if (provider === 'paypal') {
      // TODO: Verify PayPal payment using transactionId
      verified = true; // Simulate success
    } else if (provider === 'razorpay') {
      // TODO: Verify Razorpay payment using transactionId
      verified = true;
    } else if (provider === 'stripe') {
      // TODO: Verify Stripe payment using transactionId
      verified = true;
    }

    if (verified) {
      // Update payment status and user subscription
      await Payment.findOneAndUpdate({ transactionId }, { status: 'completed' });
      // TODO: Update user subscription expiry
      res.json({ success: true, message: 'Payment verified and subscription activated.' });
    } else {
      res.status(400).json({ error: 'Payment verification failed.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
