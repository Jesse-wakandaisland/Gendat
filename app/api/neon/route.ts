import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db"; // Import the query function

export async function GET(request: NextRequest) {
  try {
    // Attempt a simple query to check the database connection
    const result = await query("SELECT NOW() as now");
    const currentTime = result.rows[0]?.now;

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Neon database (AlgorithmPress-GenDB).",
      databaseTime: currentTime,
      details: {
        service: "Neon (via AlgorithmPress-GenDB connection)",
        status: "healthy",
      },
    });
  } catch (error: any) {
    console.error("Neon health check error:", error);
    // Check if the error is due to DATABASE_URL not being set
    if (error.message && error.message.includes("Database connection is not configured")) {
        return NextResponse.json({
            success: false,
            message: "Failed to connect to Neon database: DATABASE_URL environment variable is not set.",
            error: "Configuration Error",
            details: {
                service: "Neon (via AlgorithmPress-GenDB connection)",
                status: "unconfigured",
                advice: "Please set the DATABASE_URL environment variable. Refer to project documentation."
            }
        }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Neon database (AlgorithmPress-GenDB).",
        error: error.message || "Unknown error",
        details: {
          service: "Neon (via AlgorithmPress-GenDB connection)",
          status: "unhealthy",
        },
      },
      { status: 500 }
    );
  }
}

// The POST endpoint from before was a placeholder.
// For actual data operations, dedicated API routes (e.g., /api/products) will be created.
// If there's a specific need for a generic "send data to Neon" endpoint, it can be re-evaluated.
// For now, this GET serves as a connection health check.
// export async function POST(request: NextRequest) {
//   try {
//     const { schema, data, connectionString } = await request.json()
//     // ... (old placeholder code)
//   } catch (error) {
//     // ...
//   }
// }
