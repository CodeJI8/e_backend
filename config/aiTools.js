import { Type } from "@google/genai";

export const searchProductsTool = {
    name: "searchProducts",
    description:
        "Search the store's active products when a customer asks to find, browse, or get recommendations for products. Use the available filters to narrow the search. Do not use this function for general conversations.",

    parameters: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description:
                    "Product name or keyword the customer wants to search for."
            },
            price: {
                type: Type.NUMBER,
                description:
                    "Maximum product price in BDT. Use this when the customer specifies a budget or price limit."
            },
            category: {
                type: Type.STRING,
                description:
                    "Product category name the customer wants to search in."
            }
        }
    }
};
