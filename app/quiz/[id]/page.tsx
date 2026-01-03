"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Quiz, QuizSelection } from "@/app/types/Quiz";

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params?.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Game States
  const [isStarted, setIsStarted] = useState(false);
  const [preStartCountdown, setPreStartCountdown] = useState<number | null>(null);
  
  // Timer & Penilaian
  const [timeLeft, setTimeLeft] = useState(60); 
  const [userSelections, setUserSelections] = useState<QuizSelection[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  /* =======================
      HANDLERS
  ======================= */

  const submitQuiz = async (finalSelections: QuizSelection[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: finalSelections }),
      });
      const result: { score: number } = await res.json();
      setScore(result.score);
      setIsFinished(true);
    } catch (error) {
      alert("Gagal memproses nilai.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(async (): Promise<void> => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    const finalAnswerId = selectedAnswer ?? -1; 

    setUserSelections((prev) => {
      const updatedSelections = [...prev, { questionId: currentQuestion.id, answerId: finalAnswerId }];
      if (currentIndex + 1 === quiz.questions.length) {
        submitQuiz(updatedSelections);
      }
      return updatedSelections;
    });

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(60); 
    }
  }, [quiz, currentIndex, selectedAnswer]);

  const startQuizFlow = () => {
    setPreStartCountdown(5); // Mulai countdown 5 detik
  };

  /* =======================
      EFFECTS
  ======================= */

  // Pre-start Countdown Logic (5..4..3..2..1..GO!)
  useEffect(() => {
    if (preStartCountdown === null) return;

    if (preStartCountdown === 0) {
      setTimeout(() => {
        setPreStartCountdown(null);
        setIsStarted(true);
      }, 1000);
      return;
    }

    const timer = setInterval(() => {
      setPreStartCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [preStartCountdown]);

  // Quiz Timer Logic
  useEffect(() => {
    if (isFinished || loading || !quiz || !isStarted) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, loading, quiz, isStarted, handleNext]);

  // Fetch Data
  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quiz?id=${quizId}`)
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
        setLoading(false);
      });
  }, [quizId]);

  /* =======================
      RENDER LOGIC
  ======================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black dark:border-t-white mx-auto" />
      </div>
    );
  }

  // 1. Tombol Start (Layar Awal)
  if (!isStarted && preStartCountdown === null && !isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-6">
        <h1 className="text-4xl font-black mb-2">{quiz?.title}</h1>
        <p className="text-zinc-500 mb-10">60 seconds per question • {quiz?.questions.length} Questions</p>
        <button 
          onClick={startQuizFlow}
          className="group relative flex items-center justify-center px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black text-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
        >
          START QUIZ
        </button>
      </div>
    );
  }

  // 2. Countdown Screen (Ala Quizizz)
  if (preStartCountdown !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center animate-bounce">
          <h1 className="text-[12rem] font-black italic">
            {preStartCountdown === 0 ? "GO!" : preStartCountdown}
          </h1>
        </div>
      </div>
    );
  }

  // 3. Hasil Akhir
  if (isFinished) {
    const percentage = Math.round((score / (quiz?.questions.length || 1)) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 dark:bg-black dark:text-white">
        <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">Quiz Completed</h2>
        <h1 className="mt-4 text-7xl font-bold">{percentage}%</h1>
        <p className="mt-6 text-lg text-zinc-400">You scored {score} out of {quiz?.questions.length}</p>
        <button onClick={() => window.location.reload()} className="mt-12 rounded-2xl bg-black px-10 py-4 text-white dark:bg-white dark:text-black font-bold">Try Again</button>
        <a href={'/'} className="mt-5 inline-block text-sm font-medium underline-offset-4 transition-all group-hover:underline underline">Exit To Dashboard</a>
      </div>
    );
  }

  // 4. Tampilan Soal (Normal)
  const question = quiz!.questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / quiz!.questions.length) * 100;

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <main className="mx-auto max-w-3xl px-6 py-24">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{quiz?.title}</h1>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${timeLeft <= 10 ? "border-red-500 text-red-500 animate-pulse" : "border-zinc-100 dark:border-zinc-800"}`}>
              <span className="text-lg font-mono font-black">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
            <span>Question {currentIndex + 1} / {quiz?.questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="mt-4 h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 bg-black dark:bg-white`} style={{ width: `${progressPercentage}%` }} />
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-medium leading-relaxed">{question.text}</h2>
        </section>

        <section className="mb-16 space-y-4">
          {question.answer.map((ans) => (
            <button
              key={ans.id}
              disabled={selectedAnswer !== null && selectedAnswer !== ans.id}
              onClick={() => setSelectedAnswer(ans.id)}
              className={`w-full rounded-2xl border-2 p-6 text-left transition-all flex items-center
                ${selectedAnswer === ans.id ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900" : "border-zinc-100 dark:border-zinc-800"}
                ${selectedAnswer !== null && selectedAnswer !== ans.id ? "opacity-40" : "opacity-100"}
              `}
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${selectedAnswer === ans.id ? "bg-black border-black dark:bg-white dark:border-white" : "border-zinc-300"}`}>
                {selectedAnswer === ans.id && <div className="w-2 h-2 bg-white dark:bg-black rounded-full" />}
              </div>
              <span className="text-lg font-semibold">{ans.text}</span>
            </button>
          ))}
        </section>

        <footer className="flex items-center justify-between border-t border-zinc-100 pt-10 dark:border-zinc-800">
          <p className="text-sm text-zinc-400 font-medium">{selectedAnswer === null ? "Choose wisely..." : "Answer selected"}</p>
          <button
            disabled={selectedAnswer === null}
            onClick={() => handleNext()}
            className="rounded-2xl bg-black px-12 py-4 text-white font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-20 dark:bg-white dark:text-black"
          >
            {currentIndex + 1 === quiz?.questions.length ? "FINISH" : "NEXT"}
          </button>
        </footer>
      </main>
    </div>
  );
}