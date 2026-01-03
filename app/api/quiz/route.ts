import { NextResponse } from "next/server";
import { QuizService } from "@/services/QuizService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

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
    return NextResponse.json(
      { error:"Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     if (!body.title) {
//       return NextResponse.json(
//         { error: "title is required" },
//         { status: 400 }
//       );
//     }

//     const quiz = await QuizService.createQuiz({
//       title: body.title,
//     });

//     return NextResponse.json(quiz, { status: 201 });

//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message ?? "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
