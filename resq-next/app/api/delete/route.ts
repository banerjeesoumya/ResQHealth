import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { pid } = body;

  try {
    const client = await pool.connect();
    await client.query("DELETE FROM public.patient WHERE pid = $1", [pid]);
    client.release();
    return NextResponse.json({ message: "Patient deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
