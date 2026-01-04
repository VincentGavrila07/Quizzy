// app/api/user/[userId]/route.ts
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

    const user = await UserService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error: unknown) {
    console.error("GET /api/user/[userId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = Number(params.userId);
    const body = await req.json();

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      );
    }

    const updatedUser = await UserService.updateUser(userId, body);
    return NextResponse.json(updatedUser);

  } catch (error: unknown) {
    console.error("PATCH /api/user/[userId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}