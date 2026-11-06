import prisma from "../config/prisma.js";

export const searchProducts = async ({ name, price, category }) => {
    const where = {
        isActive: true
    };

    if (name?.trim()) {
        where.name = {
            contains: name.trim(),
            mode: "insensitive"
        };
    }

    if (price !== undefined && price !== null && price !== "") {
        const maxPrice = Number(price);

        if (!Number.isFinite(maxPrice) || maxPrice < 0) {
            throw new Error("Invalid price");
        }

        where.price = {
            lte: maxPrice
        };
    }

    if (category?.trim()) {
        where.categories = {
            some: {
                category: {
                    name: {
                        contains: category.trim(),
                        mode: "insensitive"
                    }
                }
            }
        };
    }

    return prisma.product.findMany({
        where,
        include: {
            images: true,
            categories: {
                include: {
                    category: true
                }
            }
        },
        take: 10
    });
};