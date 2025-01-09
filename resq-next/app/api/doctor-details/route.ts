import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    const client = await pool.connect();
    const result = await client.query(
      `SELECT docid, name, email, phone, aos 
       FROM public.doctors 
       WHERE docid = (SELECT doctor_appointed 
                      FROM public.patient 
                      WHERE pid = 'user_2r1GumGZ5nEYAQsBrHp1rmJdbz3')`
    );
    client.release();
    console.log(result.rows[0]); // only pass one row
    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
