import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    console.log("User ID:", userId);
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT docid, name, email, phone, aos 
         FROM public.doctors 
         WHERE docid = (SELECT doctor_appointed 
                        FROM public.patient 
                        WHERE pid = $1)`,
        [userId]
      );
      client.release();

      if (result.rows.length === 0) {
        return new Response("No doctor found", { status: 404 });
      }

      return new Response(JSON.stringify(result.rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      client.release();
      console.error(err);
      return new Response("Internal Server Error", { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
