import { Pool, QueryResult } from 'pg';

let pool: Pool | undefined;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error("DATABASE_URL environment variable is not set.");
      // Optionally, throw an error or handle this case differently.
      // For local development without a DB, some parts of the app might still work,
      // but any DB operation will fail.
      // For now, we'll allow the app to start but log a prominent error.
      // throw new Error("DATABASE_URL environment variable is not set.");
      return undefined;
    }
    pool = new Pool({
      connectionString,
      // ssl: {
      //   rejectUnauthorized: false, // Required for Neon, but ensure this is appropriate for your security policies
      // },
    });

    pool.on('connect', () => {
      console.log('AlgorithmPress-GenDB: Connected to PostgreSQL database.');
    });

    pool.on('error', (err) => {
      console.error('AlgorithmPress-GenDB: Unexpected error on idle client', err);
      // We might want to try and re-initialize the pool or exit the process
      // depending on the error and application requirements.
      // For now, just logging.
    });
  }
  return pool;
};

// A simple query function
export const query = async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const currentPool = getPool();
  if (!currentPool) {
    // This will happen if DATABASE_URL is not set.
    // We need to decide how to handle this. For now, throw an error
    // as any query attempt without a DB connection is a programming error.
    throw new Error(
        "AlgorithmPress-GenDB: Database connection is not configured. " +
        "Please set the DATABASE_URL environment variable. " +
        "Refer to the project documentation for setup instructions."
    );
  }
  const start = Date.now();
  try {
    const res = await currentPool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('AlgorithmPress-GenDB: Executed query', { text: text.substring(0, 100) + (text.length > 100 ? "..." : ""), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('AlgorithmPress-GenDB: Error executing query', { text: text.substring(0, 100) + (text.length > 100 ? "..." : ""), error });
    throw error;
  }
};

// Example of a more specific function (optional, can be added as needed)
// export const getClient = async () => {
//   const currentPool = getPool();
//   if (!currentPool) {
//     throw new Error("Database connection is not configured.");
//   }
//   return currentPool.connect();
// };


// Note for the user / developer:
// 1. Ensure you have a PostgreSQL database (e.g., via Neon.tech).
// 2. Set the DATABASE_URL environment variable in your .env.local file (for Next.js).
//    Example: DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
//    For Neon, the sslmode=require is important. You might also need to adjust the `ssl` config in the Pool,
//    though often Neon connection strings handle this. If direct Neon connection strings include `ssl=true` or similar,
//    the `ssl: { rejectUnauthorized: false }` might be necessary if you encounter SSL errors.
//    It's generally better if Neon provides a CA cert that can be used for verification.
//
// 3. The schema defined in `sql/schema.sql` needs to be applied to your database.
//    You can do this using a tool like `psql` or any database GUI.
//
// This `db.ts` provides a basic connection pool and a query function.
// More sophisticated error handling, transaction management, or specific query builders
// can be added as the application grows.
// Using an ORM like Prisma or Drizzle ORM could also be considered for larger projects
// to provide more type safety and abstraction over SQL.
// For now, plain `pg` is used as per the current setup.

// To ensure the pool is gracefully closed when the application shuts down (important for some environments)
// This is more relevant for standalone Node.js scripts than Next.js serverless functions,
// but good practice to be aware of.
// process.on('exit', () => {
//   if (pool) {
//     console.log('AlgorithmPress-GenDB: Closing database connection pool.');
//     pool.end();
//   }
// });
// process.on('SIGINT', () => process.exit()); // Handle Ctrl+C
// process.on('SIGTERM', () => process.exit()); // Handle kill signals

console.log("AlgorithmPress-GenDB: db.ts loaded. Connection pool will be initialized on first query if DATABASE_URL is set.");
