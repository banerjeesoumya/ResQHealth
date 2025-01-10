import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function GET(req: Request) {
  const { embedding: queryEmbedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004", {
      outputDimensionality: 512,
    }),
    value: "I have stomach pain",
  });

  const results = await index.query({
    vector: queryEmbedding,
    topK: 1, // number of similar items to retrieve
    includeVectors: true,
    includeMetadata: true,
  });
  console.log(results[0].metadata?.class);

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
