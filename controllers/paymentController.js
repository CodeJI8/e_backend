import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";
import stripe from "../config/stripe.js";
import { sign } from "node:crypto";

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const orderId = Number(req.params.orderId);

    if (
  !Number.isInteger(userId) || userId <= 0 ||
  !Number.isInteger(orderId) || orderId <= 0
) {
  return sendResponse(res, 200, "Invalid metadata; event ignored");
}

    const order = await prisma.order.findFirst({
      where: {
        userId,
        id: orderId,
      },
      include: {
        items: true,
      },
    });
    console.log("Requested orderId:", orderId);
    console.log("Logged-in userId:", userId);

    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    // Send this order's items to Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "bdt",
          product_data: {
            name: item.productName,
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      })),

      metadata: {
        orderId: String(order.id),
        userId: String(order.userId),
      },

      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });
    return sendResponse(res, 201, "Checkout session created", {
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return serverError(res, error);
  }
};

export const webhookController = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log("Stripe Event Received:", event.id, event.type);

    // ADDED: Correctly access the Checkout Session inside the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // ADDED: Extract metadata and convert IDs to numbers
      const userId = Number(session.metadata.userId);
      const orderId = Number(session.metadata.orderId);

      // ADDED: Confirm Stripe reports successful payment
      if (session.payment_status !== "paid") {
        return sendResponse(res, 200, "Payment not completed");
      }

      await prisma.$transaction(async (tx) => {
        // 1. Check whether this order belongs to this user
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            userId,
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        // 2. If already paid, don't update it again
  if (order.status === "PAID") {
  console.log("Order already PAID:", orderId);
  return;
}
        await tx.stripeEvent.create({
          data: {
            stripeEventId: event.id,
            type: event.type,
          },
        });

        // FIXED: Prisma uses id, not orderId, for the Order primary key
        await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: "PAID",
          },
        });
      });
    }

    // ADDED: Acknowledge successful webhook delivery
    return sendResponse(res, 200, "Webhook received successfully", {
      received: true,
    });
  } catch (error) {
    // ADDED: Log the actual error
    console.error("Stripe Webhook Error:", error);

    // ADDED: Handle invalid Stripe signatures separately
    if (error.type === "StripeSignatureVerificationError") {
      return sendResponse(res, 400, "Invalid Stripe signature");
    }
if (error.code === "P2002") {
  console.log("Duplicate Stripe Event:",);
  return sendResponse(res, 200, "Duplicate event ignored");
}
    // FIXED: Actually call serverError and pass res + error
    return serverError(res, error);
  }
};
