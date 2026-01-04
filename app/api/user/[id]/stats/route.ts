// app/api/user/[userId]/stats/route.ts
import { NextResponse } from "next/server";
import { UserService } from "@/services/UserService";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = Number(params.userId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      );
    }

    const stats = await UserService.getUserStatistics(userId);
    return NextResponse.json(stats);

  } catch (error: unknown) {
    console.error("GET /api/user/[userId]/stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}