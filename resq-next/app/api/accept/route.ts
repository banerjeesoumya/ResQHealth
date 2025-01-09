import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(req: Request, res: Response) {
  const body = await req.json();
  const { pid, docid } = body;

  try {
    const client = await pool.connect();
    await client.query(
      "UPDATE public.patient SET busy = true, doctor_appointed = $2 WHERE pid = $1",
      [pid, docid]
    );
    client.release();
    return NextResponse.json({ message: "Patient accepted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
