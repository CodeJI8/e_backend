
import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";

export const createProducts = async (req, res) => {

    try {

        const { name, description, price, compareAtPrice, stock, isFeatured, categories } = req.body


        const imageUrls = req.files?.map(
            (file) => `/uploads/${file.filename}`
        ) || [];


        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const categoryID = categories ? (Array.isArray(categories) ? categories : [categories]).map(Number) : [];



        const product = await prisma.product.create({

            data: {
                name, description, price, compareAtPrice, stock, isFeatured, slug
                , categories: {
                    create: categoryID.map((item) => ({
                        connect: { id: item }
                    })
                    )
                },

                images: {
                    create: imageUrls.map((imageUrl) => ({ imageUrl }))
                }


            }
        })

        return sendResponse(res, 200, "Product created successfully", product)



    }
    catch (error) {
        console.log(error)
        return serverError(res, error);

    }
}

export const getProducts = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const skip = (page - 1) * limit
const where = { isActive: true };
        const [product, total] = await prisma.$transaction([
            prisma.product.findMany({
               where: {
                    isActive: true
                },
                skip, take: limit, orderBy: { id: "asc" },
                include: { images: true }
            }),

             prisma.product.count({ where }),
        ])


      return sendResponse(
  res,
  200,
  `fetched ${product.length} of ${total} products successfully`,
  { product, total }
);

    }  catch (error) {
    console.log(error);
    return serverError;
  }

}



export const getProductsById = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        return sendResponse(res, 400, "Invalid product id");
    }

    try {
        const data = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        })

        if (!data) {
            return sendResponse(res, 404, "Product not found");
        }

        return sendResponse(res, 200, "Product fetched successfully", data);
    } catch (error) {
        console.error("Error fetching product:", error);
        return serverError(res);
    }
};
export const editProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            price,
            compareAtPrice,
            stock,
            isFeatured,
            categories
        } = req.body;

        const data = {
            ...(name !== undefined && {
                name,
                slug: name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
            }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price: Number(price) }),
            ...(compareAtPrice !== undefined && {
                compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice)
            }),
            ...(stock !== undefined && { stock: Number(stock) }),
            ...(isFeatured !== undefined && {
                isFeatured: isFeatured === true || isFeatured === "true"
            })
        };

        if (categories !== undefined) {
            const categoryIds = (Array.isArray(categories) ? categories : [categories])
                .map(Number);

            data.categories = {
                deleteMany: {},
                create: categoryIds.map((id) => ({
                    category: {
                        connect: { id }
                    }
                }))
            };
        }

        if (req.files?.length) {
            data.images = {
                create: req.files.map((file) => ({
                    imageUrl: `/uploads/${file.filename}`
                }))
            };
        }

        const product = await prisma.product.update({
            where: { id },
            data
        });

        return sendResponse(res, 200, "Product updated successfully", product);

    } catch (error) {
        return serverError(res, error);
    }
};

export const deleteProducts = async (req, res) => {
    try {

        const id = Number(req.params.id)



        const data = await prisma.product.delete({
            where: {
                id: id
            },
        })

        return sendResponse(res, 200, "Products deleted  successfully", data)

    } catch (error) {
        return serverError(res, error);
    }

}




