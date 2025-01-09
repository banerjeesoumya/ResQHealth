import {
  Message,
  generateText,
  convertToCoreMessages,
  generateObject,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { Pool } from "pg";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, email, name, phone } = body;

  const text = await generateObject({
    model: google("gemini-1.5-pro-latest"),
    system: `You are health assistant.
        You have to analyze the prescription carefully and
        provide the doctor profession class name.
        Example 1 - If the prescription has issues related to eyes, then you have to return "Ophthalmologist".
        Example 2 - If the prescription has issues related to heart, then you have to return "Cardiologist".
        Example 3 - If the prescription has issues related to brain, then you have to return "Neurologist".
        Example 4 - If the prescription has issues related to bones, then you have to return "Orthopedic".
        `,
    messages: convertToCoreMessages(messages),
    schema: z.object({
      class: z.string(),
    }),
  });

  const class_name = text.object.class.toLowerCase();
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
