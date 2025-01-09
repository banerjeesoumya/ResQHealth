import { NextResponse } from "next/server";
import { Pool } from "pg";

// Initialize the pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// return the all chatIDs for the userID

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userID } = body;
    console.log("chat-history API route log - userID:", userID);

    if (!userID) {
      return NextResponse.json(
        { error: "userID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT "chatID"
      FROM chathistory
      WHERE "userID" = $1
    `;
    const values = [userID];
    const result = await pool.query(query, values);
    console.log("Result:", result.rows);
    //console.log("Rows:", result.rowCount);

    return NextResponse.json({
      chatIDs: result.rows,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
