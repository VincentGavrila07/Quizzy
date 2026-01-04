import { Quiz, QuizSelection } from "@/app/types/Quiz";
import { supabase } from "@/lib/supabase";

export class QuizService {

    /**
     * Get all quizzes (hanya yang tidak deleted)
     */
    static async getAllQuiz() {
        const { data, error } = await supabase
            .from("quiz")
            .select("*")
            .is("deleted_at", null)
            .order("id", { ascending: true });

        if (error) {
            console.error("Error getAllQuiz:", error.message);
            throw new Error("Gagal Mengambil Data Quiz");
        }

        return data;
    }

    /**
     * Get quiz by ID with all questions and answers
     */
    static async getQuizById(id: number): Promise<Quiz | null> {
        const { data, error } = await supabase
            .from("quiz") 
            .select(`
                id,
                title,
                description,
                questions:questions ( 
                    id,
                    text,
                    order_number,
                    answer:answers (
                        id,
                        text
                    )
                )
            `)
            .eq("id", id)
            .is("deleted_at", null)
            .order("order_number", { 
                foreignTable: "questions", 
                ascending: true 
            })
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

    /**
     * Check jawaban user dan return jumlah yang benar
     */
    static async checkAnswers(userSelections: QuizSelection[]): Promise<number> {
        // Filter hanya yang sudah dijawab (answerId tidak null)
        const answeredSelections = userSelections.filter(s => s.answerId !== null);
        
        if (answeredSelections.length === 0) {
            return 0;
        }

        const answerIds = answeredSelections.map(s => s.answerId!);
        
        const { data, error } = await supabase
            .from("answers")
            .select("id, is_correct")
            .in("id", answerIds);

        if (error) {
            console.error("Error checkAnswers:", error.message);
            throw new Error("Gagal memeriksa jawaban");
        }

        // Hitung jumlah is_correct yang true
        const correctCount = data.filter(a => a.is_correct).length;
        return correctCount;
    }

    /**
     * Get detail jawaban untuk review
     */
    static async getAnswerDetails(userSelections: QuizSelection[]) {
        const answeredSelections = userSelections.filter(s => s.answerId !== null);
        
        if (answeredSelections.length === 0) {
            return [];
        }

        const answerIds = answeredSelections.map(s => s.answerId!);
        
        const { data, error } = await supabase
            .from("answers")
            .select(`
                id,
                text,
                is_correct,
                question_id,
                questions:question_id (
                    id,
                    text
                )
            `)
            .in("id", answerIds);

        if (error) {
            console.error("Error getAnswerDetails:", error.message);
            throw new Error("Gagal mengambil detail jawaban");
        }

        return data;
    }

    /**
     * Get correct answers untuk sebuah quiz (untuk show result)
     */
    static async getCorrectAnswers(quizId: number) {
        const { data, error } = await supabase
            .from("questions")
            .select(`
                id,
                text,
                answers!inner (
                    id,
                    text,
                    is_correct
                )
            `)
            .eq("quiz_id", quizId)
            .eq("answers.is_correct", true)
            .is("deleted_at", null);

        if (error) {
            console.error("Error getCorrectAnswers:", error.message);
            throw new Error("Gagal mengambil jawaban yang benar");
        }

        return data;
    }

    /**
     * Save quiz session (hasil quiz user)
     */
    static async saveQuizSession(
        userId: number,
        quizId: number,
        score: number,
        totalQuestions: number,
        correctAnswers: number,
        timeTaken?: number
    ) {
        const { data, error } = await supabase
            .from("quiz_sessions")
            .insert({
                user_id: userId,
                quiz_id: quizId,
                score: score,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                time_taken: timeTaken || null
            })
            .select()
            .single();

        if (error) {
            console.error("Error saveQuizSession:", error.message);
            throw new Error("Gagal menyimpan hasil quiz");
        }

        // Update user statistics
        await this.updateUserStatistics(userId);

        return data;
    }

    /**
     * Save individual user answers (opsional, untuk analisis detail)
     */
    static async saveUserAnswers(
        sessionId: number,
        userSelections: QuizSelection[],
        timeSpentPerQuestion?: Record<number, number>
    ) {
        const answeredSelections = userSelections.filter(s => s.answerId !== null);

        if (answeredSelections.length === 0) {
            return [];
        }

        // Get correct answer info
        const answerIds = answeredSelections.map(s => s.answerId!);
        const { data: answersData, error: answersError } = await supabase
            .from("answers")
            .select("id, is_correct")
            .in("id", answerIds);

        if (answersError) {
            console.error("Error fetching answers:", answersError.message);
            throw new Error("Gagal menyimpan detail jawaban");
        }

        // Prepare user answers
        const userAnswersToInsert = answeredSelections.map(selection => {
            const answerInfo = answersData.find(a => a.id === selection.answerId);
            return {
                session_id: sessionId,
                question_id: selection.questionId,
                answer_id: selection.answerId,
                is_correct: answerInfo?.is_correct || false,
                time_spent: timeSpentPerQuestion?.[selection.questionId] || null
            };
        });

        const { data, error } = await supabase
            .from("user_answers")
            .insert(userAnswersToInsert)
            .select();

        if (error) {
            console.error("Error saveUserAnswers:", error.message);
            throw new Error("Gagal menyimpan detail jawaban");
        }

        return data;
    }

    /**
     * Update user statistics (total_score, quizzes_completed)
     */
    private static async updateUserStatistics(userId: number) {
        // Get total score and quizzes completed
        const { data: sessions, error: sessionsError } = await supabase
            .from("quiz_sessions")
            .select("score")
            .eq("user_id", userId);

        if (sessionsError) {
            console.error("Error fetching sessions:", sessionsError.message);
            return;
        }

        const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
        const quizzesCompleted = sessions.length;

        // Update user
        const { error: updateError } = await supabase
            .from("users")
            .update({
                total_score: totalScore,
                quizzes_completed: quizzesCompleted,
                last_active: new Date().toISOString()
            })
            .eq("id", userId);

        if (updateError) {
            console.error("Error updating user statistics:", updateError.message);
        }
    }

    /**
     * Get quiz statistics
     */
    static async getQuizStatistics(quizId: number) {
        const { data, error } = await supabase
            .from("quiz_sessions")
            .select("*")
            .eq("quiz_id", quizId);

        if (error) {
            console.error("Error getQuizStatistics:", error.message);
            throw new Error("Gagal mengambil statistik quiz");
        }

        if (data.length === 0) {
            return {
                total_attempts: 0,
                average_score: 0,
                highest_score: 0,
                average_time: 0
            };
        }

        return {
            total_attempts: data.length,
            average_score: data.reduce((sum, s) => sum + s.score, 0) / data.length,
            highest_score: Math.max(...data.map(s => s.score)),
            average_time: data.reduce((sum, s) => sum + (s.time_taken || 0), 0) / data.length
        };
    }
}