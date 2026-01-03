import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Answer, QuizSelection } from "@/app/types/Quiz";

export async function POST(req: Request) {
  try {
    const body: { selections: QuizSelection[] } = await req.json();
    const { selections } = body;

    if (!selections || !Array.isArray(selections)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const answerIds = selections.map((s) => s.answerId);

    // Ambil data is_correct dari database
    const { data, error } = await supabase
      .from("answer")
      .select("id, is_correct")
      .in("id", answerIds);

    if (error) throw error;

    const answersFromDb = data as Answer[];
    const correctCount = answersFromDb.filter((a) => a.is_correct === true).length;

    return NextResponse.json({
      score: correctCount,
      total: selections.length
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}