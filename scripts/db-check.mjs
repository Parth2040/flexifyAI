// Throwaway connectivity + schema check. Run: node scripts/db-check.mjs
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

// Load MONGODB_URI from .env.local (no dotenv dependency).
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const uri = env
  .split(/\r?\n/)
  .find((l) => l.startsWith("MONGODB_URI="))
  ?.slice("MONGODB_URI=".length)
  .trim();

if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const db = client.db();
  console.log("✓ Connected to database:", db.databaseName);

  await db.command({ ping: 1 });
  console.log("✓ Ping OK");

  const exists = await db.listCollections({ name: "users" }).hasNext();
  console.log(exists ? "• users collection exists" : "• creating users collection");

  // Insert a schema-valid test user, read it, then remove it.
  const users = db.collection("users");
  const now = new Date();
  const testEmail = "db-check-temp@example.com";
  await users.updateOne(
    { email: testEmail },
    {
      $set: {
        provider: "email",
        email: testEmail,
        name: "db check",
        lastLoginAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  const found = await users.findOne({ email: testEmail });
  console.log("✓ Wrote + read a user doc:", { email: found.email, provider: found.provider });

  await users.deleteOne({ email: testEmail });
  console.log("✓ Cleaned up test doc");

  const count = await users.countDocuments();
  console.log(`• users collection now has ${count} document(s)`);
} catch (err) {
  console.error("✗ DB check failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
