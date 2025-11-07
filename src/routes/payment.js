const userAuth = require("../middlewares/auth");
const Payment = require("../models/payment");
const User = require("../models/user");

const express = require("express");

const paymentRouter = express.Router();
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  Silver: {
    name: "DevTinder Silver",
    price: 999,
    description: "Basic premium membership",
  },
  Gold: {
    name: "DevTinder Gold",
    price: 1999,
    description: "Full premium membership",
  },
};

paymentRouter.post("/payment/checkout", userAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }
    const selectedPlan = PLANS[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://13.50.246.188/premium`,
      cancel_url: `http://13.50.246.188/premium`,
      client_reference_id: req.user._id.toString(),
      customer_email: req.user.emailId,
      metadata: {
        userId: req.user._id.toString(),
        plan: plan,
      },
    });

    const paymentObj = {
      sessionId: session.id,
      paymentId: null,
      userId: req.user._id,
      status: session.payment_status,
      amount: selectedPlan.price,
      plan: plan.toUpperCase(),
    };

    const payment = new Payment(paymentObj);
    const savedPayment = await payment.save();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      session: session,
      data: savedPayment.toJSON(),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error creating checkout session: " + err.message,
    });
  }
});

paymentRouter.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("IN");
    let event = req.body;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
        console.log("EVENT : ", event);
      } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }
    let message = "";
    switch (event.type) {
      case "checkout.session.completed":
        const checkout = event.data.object;

        //console.log(paymentSuccess);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        try {
          const paymentRecord = await Payment.findOne({
            sessionId: checkout.id,
          });
          const user = await User.findOne({ _id: paymentRecord.userId });
          paymentRecord.paymentId = checkout.payment_intent;
          paymentRecord.status = checkout.payment_status;
          if (checkout.payment_status === "paid") {
            user.isPremium = true;
            user.plan = paymentRecord.plan;
          }

          console.log("Checkout completed : ", checkout);
          await user.save();
          await paymentRecord.save();
        } catch (err) {
          // console.log(`Error : `, err.message);
          return res.status(400).send(err.message);
        }
        message = `DB Record updated successfully!`;
        break;
      case "charge.updated":
        const update = event.data.object;

        try {
          const updateDoc = await Payment.findOne({
            paymentId: update.payment_intent,
          });
          updateDoc.receipt_url = update.receipt_url;
          await updateDoc.save();
        } catch (err) {
          return res.status(400).send(err.message);
        }
        message = `Recipt URL added`;

        break;
      default:
        // Unexpected event type
        //console.log(`Unhandled event type ${event.type}.`);
        message = `Unhandled event type ${event.type}.`;
    }

    // Return a 200 response to acknowledge receipt of the event
    response.status(200).send(message);
  }
);

paymentRouter.get("/payment/verify/:sessionId", userAuth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    if (session.payment_status === "paid") {
      // Get the plan from metadata
      const purchasedPlan = session.metadata.plan;

      // TODO: Update your database to mark user as premium
      // Example:
      // await User.findByIdAndUpdate(req.user._id, {
      //   isPremium: true,
      //   premiumPlan: purchasedPlan,
      //   premiumPurchasedAt: new Date()
      // });

      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentStatus: session.payment_status,
        plan: purchasedPlan,
        amountPaid: session.amount_total / 100, // Convert cents to dollars
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed",
        paymentStatus: session.payment_status,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error verifying payment: " + err.message,
    });
  }
});

module.exports = paymentRouter;
