import dns from "node:dns";
import { MongoClient } from "mongodb";

// `mongodb+srv://` requires a DNS SRV lookup. Some local/ISP/VPN resolvers
// refuse SRV queries (Node throws `querySrv ECONNREFUSED`). Prefer public
// resolvers that support SRV, while keeping the system resolvers as fallback.
try {
  dns.setServers([...new Set(["1.1.1.1", "8.8.8.8", ...dns.getServers()])]);
} catch {
  /* fall back to system DNS */
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flexify-ai";

const PUBLIC_DNS = ["1.1.1.1", "8.8.8.8"];

// Reuse a single connection across module reloads (Next.js HMR) in development.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

/**
 * Resolve a `mongodb+srv://` URI into a standard `mongodb://` URI ourselves.
 *
 * The driver's built-in SRV resolution uses Node's *global* DNS resolver, which
 * the Next.js dev-server runtime won't let us override (global `dns.setServers`
 * is ignored). An explicit `Resolver` instance IS honored, so we do the SRV/TXT
 * lookup against public DNS and hand the driver an already-resolved host list —
 * which then only needs normal A-record resolution (works fine here).
 */
async function resolveSrvUri(srvUri: string): Promise<string> {
  const url = new URL(srvUri);
  const host = url.hostname;

  const resolver = new dns.promises.Resolver();
  resolver.setServers(PUBLIC_DNS);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${host}`);
  }

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
  // Atlas TXT record carries connection options, e.g.
  // "authSource=admin&replicaSet=atlas-xxxx-shard-0" (possibly split in chunks).
  const txtParams = txtRecords.map((chunks) => chunks.join("")).join("&");
  const userInfo = url.username ? `${url.username}:${url.password}@` : "";
  const dbName = url.pathname.replace(/^\//, "");
  const originalParams = url.search ? url.search.slice(1) : "";

  // SRV implies TLS on Atlas.
  const params = ["tls=true", txtParams, originalParams].filter(Boolean).join("&");

  return `mongodb://${userInfo}${hosts}/${dbName}?${params}`;
}

async function connect(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    console.warn("[db] MONGODB_URI is not set — add it to .env.local");
  }
  try {
    // Resolve SRV ourselves so we don't depend on the driver's global-DNS lookup.
    const effectiveUri = MONGODB_URI.startsWith("mongodb+srv://")
      ? await resolveSrvUri(MONGODB_URI)
      : MONGODB_URI;

    const client = new MongoClient(effectiveUri, {
      serverSelectionTimeoutMS: 10000,
    });
    const connected = await client.connect();
    console.log("[db] Connected to MongoDB");
    return connected;
  } catch (err) {
    console.error("[db] MongoDB connection failed:", (err as Error).message);
    // Clear the cached promise so the NEXT call retries instead of forever
    // reusing this rejected connection (the classic dev-server footgun).
    globalForMongo._mongoClientPromise = undefined;
    throw err;
  }
}

/** Returns a connected MongoClient, reusing one connection across HMR. */
export function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = connect();
  }
  return globalForMongo._mongoClientPromise;
}

export default getMongoClient;
