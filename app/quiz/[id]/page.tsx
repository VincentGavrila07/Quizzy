"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quiz, QuizSelection } from "@/app/types/Quiz";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  // --- LOGIKA SUARA ASLI (TIDAK DIUBAH) ---
  const playSound = useCallback((src: string, loop: boolean = true) => {
    if (audioRef.current && audioRef.current.src.endsWith(src)) return;
    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(src);
    audio.loop = loop;
    audio.muted = isMuted;
    audio.volume = 0.4;
    audioRef.current = audio;

    if (src.includes("countdown.mp3")) {
    const stopAfter5Sec = () => {
      if (audio.currentTime >= 6) {
        audio.pause();
        audio.removeEventListener("timeupdate", stopAfter5Sec);
      }
    };
    audio.addEventListener("timeupdate", stopAfter5Sec);
  }
    audio.play().catch(() => {});
  }, [isMuted]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
  };

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
  // ------------------------------------------

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
    if (preStartCountdown === null) return;
    if (preStartCountdown === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setPreStartCountdown(null);
          setIsStarted(true);
          setIsTransitioning(false);
        }, 800);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-100 border-t-black dark:border-zinc-800 dark:border-t-white" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Syncing</p>
      </div>
    );
  }

  const MuteButton = (
    <button onClick={toggleMute} className="fixed top-4 right-4 md:top-8 md:right-8 z-50 p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 text-black dark:text-white shadow-sm">
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a2 2 0 0 0-3.54-1.3L8.66 7.3"/><path d="M3 13h1l3.29 3.29A1 1 0 0 0 9 15.58V15"/><path d="M17 9c2 2 2 6 0 8"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      )}
    </button>
  );

  if (!isStarted && preStartCountdown === null && !isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#050505] p-6 text-center">
        {MuteButton}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-black dark:text-white uppercase">{quiz?.title}</h1>
          <p className="text-zinc-500 mb-10 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">{quiz?.questions.length} Questions • 60s rounds</p>
          <button onClick={() => setPreStartCountdown(5)} className="w-full md:w-auto px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
            START QUIZ
          </button>
        </motion.div>
      </div>
    );
  }

  if (preStartCountdown !== null) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-black transition-opacity duration-700 ${isTransitioning ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}>
        <AnimatePresence mode="wait">
          <motion.h1 
            key={preStartCountdown}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="text-9xl md:text-[18rem] font-black italic text-white"
          >
            {preStartCountdown === 0 ? "GO!" : preStartCountdown}
          </motion.h1>
        </AnimatePresence>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / (quiz?.questions.length || 1)) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#050505] p-6 text-center">
        {MuteButton}
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Result</h2>
        <h1 className="mt-4 text-7xl md:text-[10rem] font-black tracking-tighter text-black dark:text-white leading-none">{percentage}%</h1>
        <p className="mt-6 text-lg md:text-2xl text-zinc-500 font-bold">Accuracy: {score} / {quiz?.questions.length}</p>
        <div className="flex flex-col gap-4 mt-12 w-full max-w-xs mx-auto">
          <button onClick={() => window.location.reload()} className="rounded-xl bg-black dark:bg-white py-5 text-white dark:text-black font-black text-lg hover:scale-105 transition-all">Try Again</button>
          <button onClick={() => router.push('/')} className="text-xs font-black text-zinc-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-[0.2em]">Exit</button>
        </div>
      </div>
    );
  }

  const question = quiz!.questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / quiz!.questions.length) * 100;

  return (
    <div className={`min-h-screen bg-white dark:bg-[#050505] transition-opacity duration-1000 ${isStarted ? "opacity-100" : "opacity-0"}`}>
      {MuteButton}
      <main className="mx-auto max-w-4xl px-5 md:px-8 py-10 md:py-20">
        <header className="mb-10 md:mb-16">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xs md:text-sm font-black tracking-tighter opacity-20 text-black dark:text-white uppercase truncate max-w-[150px] md:max-w-none">
                {quiz?.title}
                </h1>
                <div className={`px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-[1.5rem] border-2 transition-all ${timeLeft <= 10 ? "border-red-500 text-red-500 animate-pulse" : "border-zinc-100 dark:border-zinc-900 text-black dark:text-white"}`}>
                <span className="text-lg md:text-xl font-mono font-black">
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
                </div>
            </div>

            {/* Progress Info: Menampilkan nomor soal dan persentase di atas bar */}
            <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Progress</span>
                <span className="text-sm font-bold text-black dark:text-white">
                    {currentIndex + 1} <span className="text-zinc-400">/ {quiz?.questions.length}</span>
                </span>
                </div>
                <div className="text-right">
                <motion.span 
                    key={progressPercentage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black italic tracking-tighter text-black dark:text-white"
                >
                    {Math.round(progressPercentage)}%
                </motion.span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 md:h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }} 
                transition={{ duration: 0.8, ease: "circOut" }}
                className="h-full bg-black dark:bg-white" 
                />
            </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="text-2xl md:text-5xl font-black leading-tight tracking-tight text-black dark:text-white mb-10 md:mb-14">{question.text}</h2>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4 mb-16">
              {question.answer.map((ans) => (
                <button
                  key={ans.id}
                  onClick={() => setSelectedAnswer(ans.id)}
                  className={`w-full rounded-2xl md:rounded-[1.8rem] border-2 p-5 md:p-8 text-left transition-all flex items-center group
                    ${selectedAnswer === ans.id ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-lg" : "border-zinc-100 dark:border-zinc-900 dark:hover:border-zinc-700"}
                  `}
                >
                  <div className={`hidden md:flex w-8 h-8 rounded-xl border-2 mr-6 items-center justify-center font-black ${selectedAnswer === ans.id ? "bg-white text-black dark:bg-black dark:text-white border-transparent" : "border-zinc-200 dark:border-zinc-800 text-transparent"}`}>✓</div>
                  <span className="text-lg md:text-2xl font-bold">{ans.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <footer className="fixed bottom-0 left-0 w-full p-5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-900 md:static md:bg-transparent md:border-none md:p-0 md:pt-10 flex items-center justify-between">
          <div className="hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Question</span>
            <p className="text-sm font-bold text-zinc-400">{currentIndex + 1} / {quiz?.questions.length}</p>
          </div>
          <button
            disabled={selectedAnswer === null}
            onClick={() => handleNext()}
            className="w-full md:w-auto rounded-xl md:rounded-[1.5rem] bg-black dark:bg-white px-10 py-4 md:px-16 md:py-5 text-white dark:text-black font-black text-lg md:text-xl transition-all disabled:opacity-10 active:scale-95 shadow-xl"
          >
            {currentIndex + 1 === quiz?.questions.length ? "FINISH" : "NEXT"}
          </button>
        </footer>
      </main>
    </div>
  );
}