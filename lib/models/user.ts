import { Collection, Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
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

      const users = db.collection<UserDoc>(USERS_COLLECTION);
      await Promise.all([
        users.createIndex({ email: 1 }, { unique: true }),
        users.createIndex({ googleId: 1 }, { unique: true, sparse: true }),
      ]);
    })().catch((err) => {
      // Reset so a later request can retry the setup.
      setupPromise = null;
      throw err;
    });
  }
  return setupPromise;
}

/** Returns the typed `users` collection with schema + indexes guaranteed. */
export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const client = await clientPromise;
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
