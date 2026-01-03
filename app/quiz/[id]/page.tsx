"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Quiz, QuizSelection } from "@/app/types/Quiz";

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params?.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [preStartCountdown, setPreStartCountdown] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userSelections, setUserSelections] = useState<QuizSelection[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((src: string, loop: boolean = true) => {
    if (audioRef.current && audioRef.current.src.endsWith(src)) return;
    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(src);
    audio.loop = loop;
    audio.muted = isMuted;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [isMuted]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
  };

  const submitQuiz = async (finalSelections: QuizSelection[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: finalSelections }),
      });
      const result = await res.json();
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
      if (currentIndex + 1 === quiz.questions.length) submitQuiz(updatedSelections);
      return updatedSelections;
    });

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    }
  }, [quiz, currentIndex, selectedAnswer]);

  useEffect(() => {
    if (isFinished) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    if (!isStarted && preStartCountdown === null) {
      playSound("/audio/lobby.mp3", true);
    } else if (preStartCountdown !== null) {
      playSound("/audio/countdown.mp3", false);
    } else if (isStarted) {
      playSound("/audio/gameplay.mp3", true);
    }
    return () => { if (isFinished && audioRef.current) audioRef.current.pause(); };
  }, [isStarted, preStartCountdown, isFinished, playSound]);

  useEffect(() => {
    if (preStartCountdown === null) return;
    if (preStartCountdown === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setPreStartCountdown(null);
          setIsStarted(true);
          setIsTransitioning(false);
        }, 600);
      }, 1000);
      return () => clearTimeout(timer);
    }
    const interval = setInterval(() => {
      setPreStartCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [preStartCountdown]);

  useEffect(() => {
    if (isFinished || loading || !quiz || !isStarted) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, loading, quiz, isStarted, handleNext]);

  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quiz?id=${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      });
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black gap-3 text-black dark:text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black dark:border-t-white" />
        <p className="font-bold animate-pulse uppercase tracking-widest text-sm">Loading Quiz</p>
      </div>
    );
  }

  const MuteButton = (
    <button onClick={toggleMute} className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:scale-110 active:scale-90 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm text-black dark:text-white">
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a2 2 0 0 0-3.54-1.3L8.66 7.3"/><path d="M3 13h1l3.29 3.29A1 1 0 0 0 9 15.58V15"/><path d="M17 9c2 2 2 6 0 8"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      )}
    </button>
  );

  if (!isStarted && preStartCountdown === null && !isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-6">
        {MuteButton}
        <h1 className="text-5xl font-black mb-2 tracking-tighter text-center text-black dark:text-white">{quiz?.title}</h1>
        <p className="text-zinc-500 mb-10 font-bold uppercase tracking-widest text-xs">{quiz?.questions.length} Questions • 60s Per Turn</p>
        <button onClick={() => setPreStartCountdown(5)} className="px-14 py-6 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl">
          START QUIZ
        </button>
      </div>
    );
  }

  if (preStartCountdown !== null) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-black transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <div className="text-center text-white">
          <h1 className={`text-[15rem] font-black italic transition-transform duration-300 ${preStartCountdown === 0 ? "scale-125 text-white" : "scale-100"}`}>
            {preStartCountdown === 0 ? "GO!" : preStartCountdown}
          </h1>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / (quiz?.questions.length || 1)) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-6 text-center">
        {MuteButton}
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Score Summary</h2>
        <h1 className="mt-4 text-9xl font-black tracking-tighter text-black dark:text-white">{percentage}%</h1>
        <p className="mt-6 text-xl text-zinc-500 font-bold">You got {score} / {quiz?.questions.length} correct</p>
        <div className="flex flex-col gap-4 mt-12 w-full max-w-xs">
          <button onClick={() => window.location.reload()} className="w-full rounded-2xl bg-black dark:bg-white px-10 py-5 text-white dark:text-black font-black text-lg hover:scale-105 transition-all">Play Again</button>
          <a href={'/'} className="text-sm font-black text-zinc-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-8">Exit to Dashboard</a>
        </div>
      </div>
    );
  }

  const question = quiz!.questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / quiz!.questions.length) * 100;

  return (
    <div className={`min-h-screen bg-white dark:bg-black transition-opacity duration-700 ${isStarted ? "opacity-100" : "opacity-0"}`}>
      {MuteButton}
      <main className="mx-auto max-w-3xl px-6 py-20">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black tracking-tighter opacity-30 text-black dark:text-white uppercase">{quiz?.title}</h1>
            <div className={`flex items-center px-6 py-2 rounded-2xl border-2 transition-all duration-300 ${timeLeft <= 10 ? "border-red-500 text-red-500 animate-pulse scale-110" : "border-zinc-100 dark:border-zinc-800 text-black dark:text-white"}`}>
              <span className="text-xl font-mono font-black">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">
            <span>Progress: {currentIndex + 1} / {quiz?.questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000 ease-out bg-black dark:bg-white" style={{ width: `${progressPercentage}%` }} />
          </div>
        </header>

        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-black dark:text-white">{question.text}</h2>
        </section>

        <section className="mb-16 space-y-4">
          {question.answer.map((ans, idx) => (
            <button
              key={ans.id}
              onClick={() => setSelectedAnswer(ans.id)}
              className={`w-full rounded-3xl border-2 p-7 text-left transition-all duration-300 flex items-center group
                ${selectedAnswer === ans.id 
                  ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900 scale-[1.02] shadow-xl" 
                  : "border-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"}
              `}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`w-8 h-8 rounded-full border-2 mr-5 flex items-center justify-center transition-all
                ${selectedAnswer === ans.id ? "bg-black border-black dark:bg-white dark:border-white" : "border-zinc-200 group-hover:border-zinc-400"}
              `}>
                {selectedAnswer === ans.id && <div className="w-2.5 h-2.5 bg-white dark:bg-black rounded-full" />}
              </div>
              <span className="text-xl font-bold text-black dark:text-white">{ans.text}</span>
            </button>
          ))}
        </section>

        <footer className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-10">
          <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">
            {selectedAnswer === null ? "Pick an option" : "Ready?"}
          </p>
          <button
            disabled={selectedAnswer === null}
            onClick={() => handleNext()}
            className="rounded-2xl bg-black dark:bg-white px-16 py-5 text-white dark:text-black font-black text-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-5 shadow-xl"
          >
            {currentIndex + 1 === quiz?.questions.length ? "FINISH" : "NEXT"}
          </button>
        </footer>
      </main>
    </div>
  );
}