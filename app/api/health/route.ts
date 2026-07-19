import { NextResponse } from "next/server";

// Infra-only endpoint to verify the deploy is alive. Business endpoints
// (foods, drinks, places, favorites...) are Phase 2 — see
// /server and /actions for the placeholders they'll live in.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}