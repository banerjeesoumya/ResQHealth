import { NextResponse } from "next/server";
import { Pool } from "pg";

// Initialize the pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatID, userID } = body;
    console.log("chatID:", chatID, "userID:", userID);

    if (!chatID || !userID) {
      return NextResponse.json(
        { error: "chatID and userID are required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT history
      FROM chathistory
      WHERE "chatID" = $1 AND "userID" = $2
    `;
    const values = [chatID, userID];
    const result = await pool.query(query, values);
    //console.log("Result:", result.rows[0].history[0]);
    //console.log("Rows:", result.rowCount);

    if (result.rowCount === 0) {
      return NextResponse.json({ hasAccess: false });
    } else {
      return NextResponse.json({
        history: result.rows[0].history,
        hasAccess: true,
      });
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
