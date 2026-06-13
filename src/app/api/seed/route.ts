import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database seeding route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
