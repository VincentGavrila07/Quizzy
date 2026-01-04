import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Answer, QuizSelection } from "@/app/types/Quiz";

export async function POST(req: Request) {
  try {
    const body: { selections: QuizSelection[] } = await req.json();
    const { selections } = body;

    // Validasi input
    if (!selections || !Array.isArray(selections)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (selections.length === 0) {
      return NextResponse.json({ error: "No selections provided" }, { status: 400 });
    }

    // Filter hanya yang sudah dijawab (answerId tidak null)
    const answeredSelections = selections.filter(s => s.answerId !== null);

    // Jika tidak ada yang dijawab
    if (answeredSelections.length === 0) {
      return NextResponse.json({
        score: 0,
        total: selections.length,
        correctCount: 0,
        incorrectCount: 0,
        unanswered: selections.length,
        percentage: 0
      });
    }

    const answerIds = answeredSelections.map((s) => s.answerId!);

    // Ambil data is_correct dari database (GANTI "answer" jadi "answers")
    const { data, error } = await supabase
      .from("answers")
      .select("id, is_correct")
      .in("id", answerIds);

    if (error) {
      console.error("Error fetching answers:", error.message);
      throw new Error("Failed to check answers from database");
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No matching answers found in database" },
        { status: 404 }
      );
    }

    const answersFromDb = data as Answer[];
    
    // Hitung correct dan incorrect
    const correctCount = answersFromDb.filter((a) => a.is_correct === true).length;
    const incorrectCount = answersFromDb.filter((a) => a.is_correct === false).length;
    const unansweredCount = selections.length - answeredSelections.length;
    const percentage = Math.round((correctCount / selections.length) * 100);

    return NextResponse.json({
      score: correctCount,
      total: selections.length,
      correctCount,
      incorrectCount,
      unanswered: unansweredCount,
      percentage
    });

  } catch (error: unknown) {
    console.error("POST /api/quiz/check error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}