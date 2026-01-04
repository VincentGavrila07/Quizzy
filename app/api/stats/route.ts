// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get total quizzes
    const { count: totalQuizzes } = await supabase
      .from("quiz")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    // Get total attempts
    const { count: totalAttempts } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true });

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get average completion rate
    const { data: sessions } = await supabase
      .from("quiz_sessions")
      .select("score");

    const avgScore = sessions && sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
      : 0;

    return NextResponse.json({
      totalQuizzes: totalQuizzes || 0,
      totalAttempts: totalAttempts || 0,
      totalUsers: totalUsers || 0,
      avgCompletionRate: avgScore
    });

  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}