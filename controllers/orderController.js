import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";

export const Addorder = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const { shipName, shipPhone, shipAddress } = req.body;

    if (!userId) {
      return sendResponse(res, 401, " 401 Unauthorized");
    }

    if (!shipName || !shipPhone || !shipAddress) {
      return sendResponse(res, 400, "Bad Request: Missing shipping details");
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return sendResponse(res, 400, "Bad Request: Your cart is empty");
    }

    const outOfStockItem = cart.items.find(
      (item) => item.product.stock < item.quantity,
    );

    if (outOfStockItem) {
      return sendResponse(
        res,
        409,
        `Conflict: Insufficient stock for ${outOfStockItem.product.name}. Only ${outOfStockItem.product.stock} items available.`,
      );
    }

    let total = 0;
    const orderItems = cart.items.map((item) => {
      const unitPrice = Number(item.product.price);
      total += unitPrice * item.quantity;

      return {
        // FIX
        productId: item.productId, // FIX
        productName: item.product.name, // FIX
        quantity: item.quantity, // FIX
        unitPrice, // FIX
      };
    });

    console.log("1. Starting order creation");

    const order = await prisma.order.create({
      data: {
        userId,
        shipName,
        shipPhone,
        shipAddress,
        total,
        items: {
          create: orderItems,
        },
      },

      include: {
        items: true,
      },
    });
    console.log("2. Order created:", order.id);

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    console.log("3. Cart cleared");

    console.log("4. Sending response");
    return sendResponse(res, 201, "Order created successfully", order);
  } catch (error) {
    return serverError(res, error);
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) {
      return sendResponse(res, 400, "Bad request no userId available");
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    return serverError;
    console.log(error);
  }
};
