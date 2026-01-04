// services/UserService.ts
import { supabase } from "@/lib/supabase";
import { User, UserStatistics } from "@/app/types/Quiz";

export class UserService {
  
  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error getUserById:", error.message);
      throw new Error("Gagal mengambil data user");
    }

    return data as User;
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(userId: number): Promise<UserStatistics> {
    const { data, error } = await supabase
      .rpc("get_user_statistics", { p_user_id: userId });

    if (error) {
      console.error("Error getUserStatistics:", error.message);
      throw new Error("Gagal mengambil statistik user");
    }

    return data as UserStatistics;
  }

  /**
   * Get user recent activity
   */
  static async getUserRecentActivity(userId: number, limit: number = 5) {
    const { data, error } = await supabase
      .from("quiz_sessions")
      .select(`
        id,
        score,
        correct_answers,
        total_questions,
        time_taken,
        completed_at,
        quiz:quiz_id (
          id,
          title
        )
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error getUserRecentActivity:", error.message);
      throw new Error("Gagal mengambil aktivitas user");
    }

    return data;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: number, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updateUser:", error.message);
      throw new Error("Gagal update user");
    }

    return data as User;
  }

  /**
   * Create new user
   */
  static async createUser(userData: {
    username: string;
    email?: string;
    avatar_url?: string;
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error("Error createUser:", error.message);
      throw new Error("Gagal membuat user");
    }

    return data as User;
  }
}