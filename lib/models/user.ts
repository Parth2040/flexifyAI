import { Collection, Db, ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

/**
 * User schema for the `users` collection.
 *
 * This is the single source of truth for what a user document looks like. It is
 * enforced three ways:
 *   1. The `UserDoc` TypeScript interface (compile-time safety in code).
 *   2. A MongoDB `$jsonSchema` validator on the collection (database-enforced).
 *   3. Unique indexes on `email` and `googleId`.
 */
export interface UserDoc {
  _id?: ObjectId;
  /** How the user signed in. */
  provider: "google" | "email";
  /** Google account id (`sub`). Present only for Google sign-ins. */
  googleId?: string;
  /** Lowercased email — the natural unique key for a user. */
  email: string;
  /** Display name. */
  name: string;
  /** Profile picture URL (Google avatar), if any. */
  image?: string | null;
  /** Token balance bought via Polar Payments; spent to unlock images. */
  tokens?: number;
  createdAt: Date;
  lastLoginAt: Date;
}

const USERS_COLLECTION = "users";

// MongoDB document validator — the database rejects writes that don't match.
const userJsonSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["provider", "email", "name", "createdAt", "lastLoginAt"],
    properties: {
      provider: { enum: ["google", "email"] },
      googleId: { bsonType: "string" },
      email: {
        bsonType: "string",
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      },
      name: { bsonType: "string" },
      image: { bsonType: ["string", "null"] },
      tokens: { bsonType: ["int", "long", "double"] },
      createdAt: { bsonType: "date" },
      lastLoginAt: { bsonType: "date" },
    },
  },
} as const;

let setupPromise: Promise<void> | null = null;

/** Ensure the collection validator + indexes exist (runs once per process). */
async function ensureSetup(db: Db): Promise<void> {
  if (!setupPromise) {
    setupPromise = (async () => {
      // 1. Apply the JSON Schema validator. This is a BONUS (DB-enforced schema)
      //    and requires dbAdmin privileges (the `collMod`/validator commands).
      //    Atlas users often only have readWrite, so treat failure as non-fatal.
      try {
        const exists = await db
          .listCollections({ name: USERS_COLLECTION })
          .hasNext();

        if (exists) {
          await db.command({
            collMod: USERS_COLLECTION,
            validator: userJsonSchema,
            validationLevel: "moderate",
          });
        } else {
          await db.createCollection(USERS_COLLECTION, {
            validator: userJsonSchema,
          });
        }
      } catch (err) {
        console.warn(
          "[users] Skipping schema validator (needs dbAdmin privileges):",
          (err as Error).message
        );
      }

      // 2. Unique indexes — allowed for readWrite users. Also best-effort so a
      //    transient hiccup never blocks sign-in.
      try {
        const users = db.collection<UserDoc>(USERS_COLLECTION);
        await Promise.all([
          users.createIndex({ email: 1 }, { unique: true }),
          users.createIndex({ googleId: 1 }, { unique: true, sparse: true }),
        ]);
      } catch (err) {
        console.warn("[users] Could not create indexes:", (err as Error).message);
      }
    })();
  }
  return setupPromise;
}

/** Returns the typed `users` collection with schema + indexes guaranteed. */
export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const client = await getMongoClient();
  const db = client.db();
  await ensureSetup(db);
  return db.collection<UserDoc>(USERS_COLLECTION);
}

/** Convert a stored user document into the session-safe shape. */
export function toSessionUser(doc: UserDoc): SessionUser {
  return {
    id: doc._id?.toString() ?? doc.email,
    name: doc.name,
    email: doc.email,
    image: doc.image ?? undefined,
  };
}

/** Create or update a user from a Google profile, keyed on email. */
export async function upsertGoogleUser(profile: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<UserDoc> {
  const users = await getUsersCollection();
  const email = profile.email.toLowerCase();
  const now = new Date();

  await users.updateOne(
    { email },
    {
      $set: {
        provider: "google",
        googleId: profile.sub,
        email,
        name: profile.name ?? email,
        image: profile.picture ?? null,
        lastLoginAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  const doc = await users.findOne({ email });
  if (!doc) throw new Error("Failed to persist Google user");
  return doc;
}

/**
 * Create or update a user from the simplified email login, keyed on email.
 * Preserves an existing provider (e.g. won't downgrade a Google user).
 */
export async function upsertEmailUser(email: string): Promise<UserDoc> {
  const users = await getUsersCollection();
  const normalized = email.toLowerCase();
  const now = new Date();

  await users.updateOne(
    { email: normalized },
    {
      $set: { email: normalized, lastLoginAt: now },
      $setOnInsert: {
        provider: "email",
        name: normalized.split("@")[0],
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const doc = await users.findOne({ email: normalized });
  if (!doc) throw new Error("Failed to persist email user");
  return doc;
}

// ── Token balance (purchased via Polar Payments) ────────────────────────────

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/** Current token balance for a user id (0 if unknown). */
export async function getUserTokens(userId: string): Promise<number> {
  const _id = toObjectId(userId);
  if (!_id) return 0;
  const users = await getUsersCollection();
  const doc = await users.findOne({ _id }, { projection: { tokens: 1 } });
  return doc?.tokens ?? 0;
}

/** Credit tokens to a user (used by the Polar webhook). Returns new balance. */
export async function addTokens(userId: string, amount: number): Promise<number> {
  const _id = toObjectId(userId);
  if (!_id) throw new Error(`Invalid user id: ${userId}`);
  const users = await getUsersCollection();
  const res = await users.findOneAndUpdate(
    { _id },
    { $inc: { tokens: amount } },
    { returnDocument: "after" }
  );
  return res?.tokens ?? 0;
}

/**
 * Atomically spend `amount` credits. Returns the new balance, or null if the
 * user didn't have enough (so callers can lock the result).
 */
export async function spendTokens(
  userId: string,
  amount: number
): Promise<number | null> {
  const _id = toObjectId(userId);
  if (!_id) return null;
  const users = await getUsersCollection();
  const res = await users.findOneAndUpdate(
    { _id, tokens: { $gte: amount } },
    { $inc: { tokens: -amount } },
    { returnDocument: "after" }
  );
  return res ? res.tokens ?? 0 : null;
}

// ── Webhook idempotency ─────────────────────────────────────────────────────

const EVENTS_COLLECTION = "processed_events";

/**
 * Records a webhook event id. Returns true if this is the first time we've seen
 * it (safe to process), false if it was already handled (skip — duplicate).
 */
export async function markEventProcessed(eventId: string): Promise<boolean> {
  const client = await getMongoClient();
  const events = client
    .db()
    .collection<{ _id: string; at: Date }>(EVENTS_COLLECTION);
  try {
    await events.insertOne({ _id: eventId, at: new Date() });
    return true;
  } catch (err) {
    // Duplicate key → already processed.
    if ((err as { code?: number }).code === 11000) return false;
    throw err;
  }
}
