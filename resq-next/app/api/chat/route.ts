import { createResource } from "@/lib/actions/resources";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToCoreMessages,
  generateText,
  Message,
  streamText,
  experimental_wrapLanguageModel as wrapLanguageModel,
  tool,
} from "ai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embedding";
import { Pool } from "pg";
import { cacheMiddleware } from "@/lib/ai/middleware";

const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error("GOOGLE_API_KEY is not defined");
}

const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const wrappedModel = wrapLanguageModel({
  model: google("gemini-1.5-pro-latest"),
  middleware: cacheMiddleware,
});

export async function POST(req: Request) {
  const body = await req.json();
  //console.log("Request body:", body);
  const { messages, chatID, userID } = body;
  //console.log("Messages:", messages);
  // console.log("ChatID:", chatID);
  // console.log("UserID:", userID);

  const result = streamText({
    model: wrappedModel,
    system: `You are a knowledgeable and empathetic health assistant. Your name is ResQ health agent.
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
        description: `Retrieve information from the health chatbot's knowledge base to answer user questions. 
          Use this tool to provide accurate and relevant responses based on the stored knowledge base.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => {
          console.log("Getting information from knowledge base...");
          findRelevantContent(question);
        },
      }),
    },
    async onFinish({ text }) {
      await onFinish({ text, messages });
    },
  });

  async function onFinish({
    text,
    messages,
  }: {
    text: string;
    messages: Message[];
  }) {
    try {
      messages.push({
        id: messages.length.toString(),
        role: "assistant",
        content: text,
      });
      const currentHistory = JSON.stringify(messages);
      const upsertQuery = `
        INSERT INTO chathistory ("chatID", "userID", history)
        VALUES ($1, $2, $3)
        ON CONFLICT ("chatID")
        DO UPDATE SET history = EXCLUDED.history, "userID" = EXCLUDED."userID"
      `;
      const values = [chatID, userID, currentHistory];
      await pool.query(upsertQuery, values);

      console.log("Updated history");
    } catch (err) {
      console.error("DB update error:", err);
    }
  }

  return result.toDataStreamResponse();
}
