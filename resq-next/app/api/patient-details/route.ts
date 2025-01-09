import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM public.patient WHERE disorder = $1",
      ["gastroenterologist"]
    );
    client.release();
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
