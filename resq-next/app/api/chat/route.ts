import { createResource } from "@/lib/actions/resources";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, generateText, streamText, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embedding";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-1.5-pro-latest"),
    system: `You are a knowledgeable and empathetic health assistant. 
    Respond clearly in 10-100 words, but you may extend it to 200 words including points if detailed answer is needed, focusing on essentials and avoiding unnecessary details.
    You have access to some tools like addInformation, getInformation, isHarmful to answer.`,
    messages: convertToCoreMessages(messages),
    //experimental_toolCallStreaming: true,
    //experimental_continueSteps: true,
    maxSteps: 5,
    tools: {
      isHarmful: tool({
        description: `Determines whether a given product or product code or label is harmful or not. This can be used as an additional step.`,
        parameters: z.object({
          product_code: z
            .string()
            .describe(
              "The name of the product or label to evaluate for potential harm."
            ),
        }),
        execute: async ({ product_code }) => {
          try {
            const url = `https://world.openfoodfacts.net/api/v2/product/${product_code}?fields=product_name,ingredients_text`;
            const response = await fetch(url);
            const data = await response.json();

            const ingredients = data.product.ingredients_text;
            const product_name = data.product.product_name;

            let health_history = "";
            (
              await findRelevantContent(
                "what problems/health issues/diseases I have ?"
              )
            ).forEach((item) => {
              health_history += item.name + ", ";
            });

            const result = await generateText({
              model: google("gemini-1.5-flash-8b-latest"),
              prompt: `I have the following health issues: ${health_history} \n\nIngredients: ${ingredients} \n\nProduct Name(Product code): ${product_name}(${product_code})  \n\nIs this product harmful for me? answer under 200 words including points if needed.`,
            });
            const responseText = result.text;
            return responseText;
          } catch (e) {
            return `Error while fetching data for product ${product_code}.`;
          }
        },
      }),
      addResource: tool({
        description: `Add a resource to the health chatbot's knowledge base. 
        Use this tool whenever the user provides information related to health, diseases, or medical topics. 
        Ensure the content is relevant to improving responses or enriching the chatbot's understanding of health-related queries.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => {
          console.log("Adding resource to knowledge base...");
          createResource({ content });
        },
      }),
      getInformation: tool({
        description: `get information from knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  //return result.then((r) => new Response(JSON.stringify(r), { status: 200 }));  ---> generateText
  return result.toDataStreamResponse();
}