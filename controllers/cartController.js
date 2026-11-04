import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";

export const AddCart = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const items = req.body?.items;

    if (!Number.isSafeInteger(userId) || userId < 1) {
      return sendResponse(res, 401, "Invalid user");
    }

    if (!Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, "Items must be a non-empty array");
    }

    const productIds = new Set();
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return sendResponse(res, 400, "Each item must be an object");
      }

      const { productId, quantity } = item;
      if (!Number.isSafeInteger(productId) || productId < 1) {
        return sendResponse(
          res,
          400,
          "Each productId must be a positive integer",
        );
      }

      if (!Number.isSafeInteger(quantity) || quantity < 0) {
        return sendResponse(
          res,
          400,
          "Each quantity must be a non-negative integer",
        );
      }

      if (productIds.has(productId)) {
        return sendResponse(res, 400, "Duplicate productIds are not allowed");
      }
      productIds.add(productId);
    }

    const updatedCart = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
      if (!cart) {
        return null;
      }

      const quantitiesToSet = items.filter((item) => item.quantity > 0);
      const products = quantitiesToSet.length
        ? await tx.product.findMany({
            where: {
              id: { in: quantitiesToSet.map((item) => item.productId) },
            },
            select: {
              id: true,
              stock: true,
              isActive: true,
            },
          })
        : [];
      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      for (const item of quantitiesToSet) {
        const product = productsById.get(item.productId);
        if (!product) {
          return { error: "Product not found" };
        }
        if (!product.isActive) {
          return { error: "Product is not available" };
        }
        if (item.quantity > product.stock) {
          return { error: "Requested quantity exceeds available stock" };
        }
      }

      for (const item of items) {
        const { productId, quantity } = item;

        if (quantity === 0) {
          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
              productId,
            },
          });
        } else {
          await tx.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId,
              },
            },
            update: {
              quantity,
            },
            create: {
              cartId: cart.id,
              productId,
              quantity,
            },
          });
        }
      }

      return tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    if (!updatedCart) {
      return sendResponse(res, 404, "Cart not found");
    }
    if ("error" in updatedCart) {
      const statusCode = updatedCart.error === "Product not found" ? 404 : 400;
      return sendResponse(res, statusCode, updatedCart.error);
    }

    return sendResponse(res, 200, "Cart updated successfully", updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return serverError(res);
  }
};

// export const addCart = async (req, res) =>
//     try {
//         const productID = Number(req.params.id);
//         const userId = Number(req.user.userId);
//         const quantity = Number(req.body.quantity);

//         const product = await prisma.product.findUnique({
//             where: {
//                 id: productID
//             }
//         });

//         if (!product) {
//             return sendResponse(res, 404, "Product not found");
//         }

//         const cart = await prisma.cart.upsert({
//             where: { userId },
//             update: {},
//             create: { userId },
//         });

//         const ex_pr = await prisma.cartItem.findUnique({
//             where: {
//                 cartId_productId: {
//                     cartId: cart.id,
//                     productId: productID
//                 }
//             }
//         });

//         const newQuant = ex_pr ? ex_pr.quantity + quantity : quantity;

//         if (newQuant > product.stock) {
//             return sendResponse(res, 400, "Insufficient stock");
//         }

//         const cartItem = await prisma.cartItem.upsert({
//             where: {
//                 cartId_productId: {
//                     cartId: cart.id,
//                     productId: productID
//                 }
//             },
//             update: {
//                 quantity: newQuant
//             },
//             create: {
//                 cartId: cart.id,
//                 productId: productID,
//                 quantity
//             }
//         });

//         return sendResponse(res, 200, "Product added to cart", cartItem);
//     } catch (error) {
//         return serverError(res, error);
//     }
// };

// export const AddCart = async (req, res) => {
//     try {
//         const id = req.params.id
//         const {items}  =req.body

//         const cart =  await prisma.cart.findUnique({
//             where:{
//                 userId:id
//             }
//         });

//         for( const  item in items){
//  const{productId, quantity} = item

//  if (quantity===0) {

//     await prisma.cartItem.deleteMany({
//         where:{
//             cartId:cart.id,
//             productId
//         }
//     })

//  }

//  else{
//     await prisma.cartItem.updateMany
//     ({
//         where:{
//             cartId:cart.id,
//             productId
//         },
//            data: {
//               quantity,
//             },
//     })

//           return prisma.cart.findUnique({
//             where:{
//                 userId
//             },
//             include:{
//                 items:{
//                     include:{
//                         product:true
//                     }

//                 }

//             }
//         })

//  }

//         }

//     } catch (error) {
//         return serverError;
//     }
// };
