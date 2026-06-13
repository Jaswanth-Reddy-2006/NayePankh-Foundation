import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Please define the DATABASE_URL environment variable in .env.local");
}

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Neon secure server connections
    },
  });
} else {
  // Maintain a cached pool in development across hot reloads
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  pool = global.pgPool;
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

// Helper to get a transaction client from the pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}
