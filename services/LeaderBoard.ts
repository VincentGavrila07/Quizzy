// services/LeaderboardService.ts
import { supabase } from "@/lib/supabase";
import { LeaderboardEntry, GlobalLeaderboardEntry } from "@/app/types/Quiz";

export class LeaderboardService {
  
  /**
   * Get leaderboard untuk quiz tertentu
   */
  static async getQuizLeaderboard(
    quizId: number, 
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("quiz_leaderboard")
      .select("*")
      .eq("quiz_id", quizId)
      .limit(limit);

    if (error) {
      console.error("Error getQuizLeaderboard:", error.message);
      throw new Error("Gagal mengambil leaderboard quiz");
    }

    return data as LeaderboardEntry[];
  }

  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(
    limit: number = 20
  ): Promise<GlobalLeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("global_leaderboard")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error getGlobalLeaderboard:", error.message);
      throw new Error("Gagal mengambil global leaderboard");
    }

    return data as GlobalLeaderboardEntry[];
  }

  /**
   * Get user rank di quiz tertentu
   */
  static async getUserQuizRank(userId: number, quizId: number) {
    const { data, error } = await supabase
      .from("quiz_leaderboard")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error getUserQuizRank:", error.message);
      throw new Error("Gagal mengambil rank user");
    }

    return data;
  }

  /**
   * Get user global rank
   */
  static async getUserGlobalRank(userId: number) {
    const { data, error } = await supabase
      .from("global_leaderboard")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error getUserGlobalRank:", error.message);
      throw new Error("Gagal mengambil global rank user");
    }

    return data;
  }
}