import { Quiz } from "@/app/types/Quiz";
import { supabase } from "@/lib/supabase";

export class QuizService {

    static async getAllQuiz() {
        const { data, error } = await supabase
            .from("Quiz")
            .select("*");

        if (error) {
            console.error("Error getAllQuiz:", error.message);
            throw new Error("Gagal Mengambil Data Quiz");
        }

        return data;
    }

    static async getQuizById(id: number): Promise<Quiz | null> {
        const { data, error } = await supabase
            .from("Quiz") 
            .select(`
                id,
                title,
                questions:Questions ( 
                    id,
                    text,
                    answer:answer (
                        id,
                        text
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            console.error("Supabase Error Detail:", error.message, error.hint);
            throw new Error(error.message);
        }

        return data as unknown as Quiz;
    }

    static async checkAnswers(userSelections: { questionId: number, answerId: number }[]) {
        const answerIds = userSelections.map(s => s.answerId);
        
        const { data, error } = await supabase
            .from("answer")
            .select("id, is_correct")
            .in("id", answerIds);

        if (error) throw error;

        // Hitung jumlah is_correct yang true
        const correctCount = data.filter(a => a.is_correct).length;
        return correctCount;
    }
}