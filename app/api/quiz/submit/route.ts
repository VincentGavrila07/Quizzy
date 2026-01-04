// app/api/quiz/submit/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { QuizSelection } from "@/app/types/Quiz";

export async function POST(req: Request) {
  try {
    const body: {
      userId: number;
      quizId: number;
      selections: QuizSelection[];
      timeTaken?: number; // dalam detik
    } = await req.json();

    const { userId, quizId, selections, timeTaken } = body;

    // Validasi input
    if (!userId || !quizId) {
      return NextResponse.json(
        { error: "userId and quizId are required" },
        { status: 400 }
      );
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json(
        { error: "selections array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Filter jawaban yang sudah dijawab
    const answeredSelections = selections.filter(s => s.answerId !== null);

    if (answeredSelections.length === 0) {
      return NextResponse.json(
        { error: "At least one question must be answered" },
        { status: 400 }
      );
    }

    // Ambil jawaban dari database untuk cek is_correct
    const answerIds = answeredSelections.map(s => s.answerId!);

    const { data: answersData, error: answersError } = await supabase
      .from("answers")
      .select("id, is_correct, question_id")
      .in("id", answerIds);

    if (answersError) {
      console.error("Error fetching answers:", answersError.message);
      throw new Error("Failed to validate answers");
    }

    if (!answersData || answersData.length === 0) {
      return NextResponse.json(
        { error: "Invalid answer IDs provided" },
        { status: 400 }
      );
    }

    // Hitung score
    const correctCount = answersData.filter((a) => a.is_correct === true).length;
    const totalQuestions = selections.length;
    const incorrectCount = answeredSelections.length - correctCount;
    const unansweredCount = totalQuestions - answeredSelections.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // 1. Save quiz session
    const { data: sessionData, error: sessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        time_taken: timeTaken || null
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error saving session:", sessionError.message);
      throw new Error("Failed to save quiz session");
    }

    // 2. Save individual user answers (untuk analytics)
    const userAnswersToInsert = answeredSelections.map(selection => {
      const answerInfo = answersData.find(a => a.id === selection.answerId);
      return {
        session_id: sessionData.id,
        question_id: selection.questionId,
        answer_id: selection.answerId,
        is_correct: answerInfo?.is_correct || false,
        time_spent: null // bisa ditambahkan nanti jika ada tracking per soal
      };
    });

    const { error: userAnswersError } = await supabase
      .from("user_answers")
      .insert(userAnswersToInsert);

    if (userAnswersError) {
      console.error("Error saving user answers:", userAnswersError.message);
      // Tidak throw error karena session sudah tersimpan
    }

    // 3. Update user statistics
    const { data: allSessions, error: statsError } = await supabase
      .from("quiz_sessions")
      .select("score")
      .eq("user_id", userId);

    if (!statsError && allSessions) {
      const totalScore = allSessions.reduce((sum, s) => sum + s.score, 0);
      const quizzesCompleted = allSessions.length;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          total_score: totalScore,
          quizzes_completed: quizzesCompleted,
          last_active: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user stats:", updateError.message);
      }
    }

    // 4. Get user rank in this quiz (dari view)
    const { data: rankData } = await supabase
      .from("quiz_leaderboard")
      .select("rank")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .single();

    // 5. Get grade/message
    let grade = '';
    let message = '';
    if (score >= 90) {
      grade = 'Excellent';
      message = '🏆 Outstanding performance!';
    } else if (score >= 80) {
      grade = 'Very Good';
      message = '🌟 Great job!';
    } else if (score >= 70) {
      grade = 'Good';
      message = '👍 Well done!';
    } else if (score >= 60) {
      grade = 'Fair';
      message = '👌 Not bad!';
    } else {
      grade = 'Keep Practicing';
      message = '💪 Keep trying!';
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      result: {
        score,
        correctCount,
        incorrectCount,
        unanswered: unansweredCount,
        total: totalQuestions,
        percentage: score,
        grade,
        message
      },
      timeTaken: timeTaken || null,
      rank: rankData?.rank || null,
      completedAt: sessionData.completed_at
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("POST /api/quiz/submit error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}