import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection("waitlist");

    const entry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(entry);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error("Waitlist DB error:", error);
    return NextResponse.json({ error: "Failed to store waitlist entry" }, { status: 500 });
  }
}
