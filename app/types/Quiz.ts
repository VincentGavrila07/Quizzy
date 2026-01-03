export type Answer = {
  id: number;
  text: string;
  is_correct?: boolean; 
};

export type Question = {
  id: number;
  text: string;
  answer: Answer[];
};

export type Quiz = {
  id: number;
  title: string;
  questions: Question[];
};

export interface QuizSelection {
  questionId: number;
  answerId: number | null;
}