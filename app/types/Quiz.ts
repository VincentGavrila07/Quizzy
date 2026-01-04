// types/database.ts

export type Answer = {
  id: number;
  question_id: number;
  text: string;
  is_correct?: boolean;
  created_at: string;
};

export type Question = {
  id: number;
  quiz_id: number;
  text: string;
  order_number: number;
  created_at: string;
  deleted_at: string | null;
  answer?: Answer[]; // nested relation
};

export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  deleted_at: string | null;
  questions?: Question[]; // nested relation
};

export type User = {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  total_score: number;
  quizzes_completed: number;
  created_at: string;
  last_active: string | null;
};

export type QuizSession = {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number | null;
  completed_at: string;
};

export type UserAnswer = {
  id: number;
  session_id: number;
  question_id: number;
  answer_id: number | null;
  is_correct: boolean;
  time_spent: number | null;
  answered_at: string;
};

export interface QuizSelection {
  questionId: number;
  answerId: number | null;
}

// Helper types for API responses
export type QuizWithQuestions = Quiz & {
  questions: (Question & {
    answers: Answer[];
  })[];
};

export type LeaderboardEntry = {
  id: number;
  username: string;
  avatar_url: string | null;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number | null;
  completed_at: string;
  rank: number;
};

export type GlobalLeaderboardEntry = {
  id: number;
  username: string;
  avatar_url: string | null;
  total_score: number;
  quizzes_completed: number;
  avg_score_per_quiz: number;
  rank: number;
};

export type UserStatistics = {
  total_attempts: number;
  unique_quizzes: number;
  average_score: number;
  best_score: number;
  total_correct: number;
  total_questions_answered: number;
  avg_time_per_quiz: number;
};