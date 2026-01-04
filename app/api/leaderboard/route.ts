// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { LeaderboardService } from "@/services/LeaderBoard";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const limit = searchParams.get("limit");

    // GET /api/leaderboard?quizId=1
    if (quizId) {
      const leaderboard = await LeaderboardService.getQuizLeaderboard(
        Number(quizId),
        limit ? Number(limit) : 10
      );
      return NextResponse.json(leaderboard);
    }

    // GET /api/leaderboard (global)
    const globalLeaderboard = await LeaderboardService.getGlobalLeaderboard(
      limit ? Number(limit) : 20
    );
    return NextResponse.json(globalLeaderboard);

  } catch (error: unknown) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}