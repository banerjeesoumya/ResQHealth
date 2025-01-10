import {
  Message,
  generateText,
  convertToCoreMessages,
  generateObject,
} from "ai";
import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { Pool } from "pg";
import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, email, name, phone } = body;

  const text = await generateText({
    model: google("gemini-1.5-pro-latest"),
    system: `You are health assistant.
        You have to analyze the prescription carefully and
        provide the single line summary with all important keywords.`,
    messages: convertToCoreMessages(messages),
    maxSteps: 3,
  });

  console.log("Generated text:", text.text);

  const { embedding: queryEmbedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004", {
      outputDimensionality: 512,
    }),
    value: text.text,
  });

  const results = await index.query({
    vector: queryEmbedding,
    topK: 1, // number of similar items to retrieve
    includeVectors: true,
    includeMetadata: true,
  });
  console.log(results[0].metadata?.class);

  const class_name = results[0].metadata?.class;
  console.log("Class name:", class_name);
  const { userId } = await auth();

  // make an sql query to save in the table

  const upsertQuery =
    "INSERT INTO patient (pid, email, pname, phone, disorder) VALUES ($1, $2, $3, $4, $5)";
  const values = [userId, email, name, phone, class_name];
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(upsertQuery, values);
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (err) {
    console.error("Database error:", err);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
