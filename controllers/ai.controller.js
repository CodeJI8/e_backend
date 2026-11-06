import { ai } from "../config/gemini.js";
import { sendResponse, serverError } from "../utils/response.js";
import { searchProducts } from "../utils/searchProducts.js";
import { searchProductsTool } from "../config/aiTools.js";

export const chatWithApi = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return sendResponse(res, 400, "Message is required");
    }

    // Validate history
    if (!Array.isArray(history)) {
      return sendResponse(res, 400, "History must be an array");
    }

    // Validate history messages
    const invalidHistory = history.some(
      (item) =>
        !item ||
        !["user", "model"].includes(item.role) ||
        !Array.isArray(item.parts) ||
        item.parts.some((part) => typeof part?.text !== "string"),
    );

    if (invalidHistory) {
      return sendResponse(res, 400, "Invalid conversation history");
    }

    const contents = [
      ...history,
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction:
          "You are a friendly AI shopping assistant. Help customers with their shopping questions. Be polite, conversational and concise. Do not invent product names, prices or availability.",

        tools: [
          {
            functionDeclarations: [searchProductsTool],
          },
        ],
      },
    });



    const functionCall = response.functionCalls?.[0];
    if (functionCall?.name === "searchProducts") {
      const products = await searchProducts(functionCall.args);

      const finalResponse =  await ai.models.generateContent({
  model: "gemini-3.1-flash-lite",
contents:[
  ...contents,
    response.candidates[0].content, 
    {
            role: "user",
            parts: [{
                functionResponse: {
                    name: functionCall.name,
                    id: functionCall.id,
                    response: { products } // Database থেকে পাওয়া result
                }
            }]
        }



],
   config: {
        systemInstruction: "You are a friendly AI shopping assistant. Recommend products using the provided product data. Do not invent product names, prices or availability."
    }

      })

   

return sendResponse(res, 200, "AI response generated", {
    reply: finalResponse.text
});

    }







    return sendResponse(res, 200, "AI response generated", {
      reply: response.text,
    });
  } 
  
  
  
  
  
  catch (error) {
    if ([429, 503].includes(error?.status)) {

      return sendResponse( res, error.status, "AI service is temporarily unavailable. Please try again.",
      );
    }

    return serverError(res, error);
  }
};
