// app/api/quiz/route.ts
import { NextResponse } from "next/server";
import { QuizService } from "@/services/QuizService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const stats = searchParams.get("stats");

    // GET /api/quiz?id=1&stats=true
    if (id && stats === "true") {
      const statistics = await QuizService.getQuizStatistics(Number(id));
      return NextResponse.json(statistics);
    }

    // GET /api/quiz?id=1
    if (id) {
      const quiz = await QuizService.getQuizById(Number(id));

      if (!quiz) {
        return NextResponse.json(
          { error: "Quiz not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(quiz);
    }

    // GET /api/quiz
    const quizzes = await QuizService.getAllQuiz();
    return NextResponse.json(quizzes);

  } catch (error: unknown) {
    console.error("GET /api/quiz error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // POST /api/quiz { action: "check-answers", ... }
    if (action === "check-answers") {
      const { userSelections } = body;

      if (!userSelections || !Array.isArray(userSelections)) {
        return NextResponse.json(
          { error: "userSelections is required and must be an array" },
          { status: 400 }
        );
      }

      const correctCount = await QuizService.checkAnswers(userSelections);
      return NextResponse.json({ correctCount });
    }

    // POST /api/quiz { action: "submit-quiz", ... }
    if (action === "submit-quiz") {
      const {
        userId,
        quizId,
        userSelections,
        timeTaken,
        timeSpentPerQuestion
      } = body;

      if (!userId || !quizId || !userSelections) {
        return NextResponse.json(
          { error: "userId, quizId, and userSelections are required" },
          { status: 400 }
        );
      }

      // Check answers
      const correctCount = await QuizService.checkAnswers(userSelections);
      const totalQuestions = userSelections.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Save session
      const session = await QuizService.saveQuizSession(
        userId,
        quizId,
        score,
        totalQuestions,
        correctCount,
        timeTaken
      );

      // Save individual answers (optional)
      if (session) {
        await QuizService.saveUserAnswers(
          session.id,
          userSelections,
          timeSpentPerQuestion
        );
      }

      return NextResponse.json({
        session,
        score,
        correctCount,
        totalQuestions,
      }, { status: 201 });
    }

    // POST /api/quiz { action: "get-correct-answers", ... }
    if (action === "get-correct-answers") {
      const { quizId } = body;

      if (!quizId) {
        return NextResponse.json(
          { error: "quizId is required" },
          { status: 400 }
        );
      }

      const correctAnswers = await QuizService.getCorrectAnswers(quizId);
      return NextResponse.json({ correctAnswers });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error: unknown) {
    console.error("POST /api/quiz error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}