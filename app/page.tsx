"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./types/Quiz";
import Link from "next/link";
import { motion } from "framer-motion";

interface QuizWithStats extends Quiz {
  total_attempts?: number;
  avg_score?: number;
}

interface GlobalStats {
  totalQuizzes: number;
  totalAttempts: number;
  totalUsers: number;
  avgCompletionRate: number;
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes dengan stats
        const [quizzesRes, statsRes] = await Promise.all([
          fetch("/api/quiz"),
          fetch("/api/stats")
        ]);

        const quizzesData = await quizzesRes.json();
        const statsData = await statsRes.json();

        setQuizzes(quizzesData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#050505] dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg sm:text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
            QUIZZY.
          </Link>

          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-500">
            <Link 
              href="/leaderboard"
              className="hidden sm:block hover:text-black dark:hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link 
              href="/profile"
              className="hidden sm:block hover:text-black dark:hover:text-white transition-colors"
            >
              Profile
            </Link>
            <button className="rounded-full bg-black px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-bold text-white dark:bg-white dark:text-black active:scale-95 transition hover:shadow-lg">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 sm:pt-36 pb-24">
        
        {/* HERO */}
        <section className="relative mb-24 sm:mb-32">
          <div className="absolute -top-16 -left-16 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900/30 -z-10" />
          <div className="absolute -bottom-16 -right-16 h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-zinc-50 blur-3xl dark:bg-zinc-900/20 -z-10" />

          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                mb-6
                text-[2.75rem]
                leading-[1.05]
                font-black tracking-[-0.04em]
                sm:text-6xl
                md:text-7xl
                lg:text-8xl
                xl:text-9xl
              "
            >
              Level up your <br />
              <span className="text-zinc-300 dark:text-zinc-700">
                intellect.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-zinc-500 dark:text-zinc-400"
            >
              Quizzy combines high-fidelity interactions with curated knowledge.
              Experience the next generation of digital learning.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4"
            >
              <a 
                href="#quizzes"
                className="w-full sm:w-auto text-center rounded-2xl bg-black px-8 py-4 font-bold text-white transition hover:scale-105 active:scale-95 dark:bg-white dark:text-black shadow-xl"
              >
                Explore All Quizzes
              </a>
              <Link 
                href="/leaderboard"
                className="w-full sm:w-auto text-center rounded-2xl border border-zinc-200 px-8 py-4 font-bold transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                View Leaderboard
              </Link>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        {stats && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-24 sm:mb-32"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-6 dark:border-zinc-900 dark:bg-[#0A0A0A]">
                <div className="text-3xl sm:text-4xl font-black mb-2">
                  {stats.totalQuizzes}
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-400">
                  Total Quizzes
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-6 dark:border-zinc-900 dark:bg-[#0A0A0A]">
                <div className="text-3xl sm:text-4xl font-black mb-2">
                  {stats.totalAttempts.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-400">
                  Attempts Made
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-6 dark:border-zinc-900 dark:bg-[#0A0A0A]">
                <div className="text-3xl sm:text-4xl font-black mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-400">
                  Active Users
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-6 dark:border-zinc-900 dark:bg-[#0A0A0A]">
                <div className="text-3xl sm:text-4xl font-black mb-2">
                  {stats.avgCompletionRate}%
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-400">
                  Avg. Score
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* QUIZ LIST */}
        <section id="quizzes">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Curated Selection
              </h2>
              <h3 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Available Quizzes
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px w-24 bg-zinc-100 dark:bg-zinc-900" />
              <span className="text-xs font-bold text-zinc-400">
                {quizzes.length} Total
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50"
                />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8"
            >
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  variants={itemVariants}
                >
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="
                      group relative flex flex-col justify-between
                      rounded-[2rem] border border-zinc-100
                      bg-white p-6 sm:p-8
                      transition-all
                      hover:-translate-y-1 sm:hover:-translate-y-2
                      hover:border-black hover:shadow-2xl
                      dark:border-zinc-900 dark:bg-[#0A0A0A]
                      dark:hover:border-white
                      h-full
                    "
                  >
                    <div>
                      <div className="mb-6 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-zinc-50 text-lg sm:text-xl font-black transition group-hover:bg-black group-hover:text-white dark:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-black">
                        {quiz.title.charAt(0)}
                      </div>

                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                        {quiz.title}
                      </h3>

                      {quiz.description && (
                        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <p className="flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-400">
                          <svg
                            className="h-4 w-4 opacity-70"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 3" />
                          </svg>
                          5 questions
                        </p>

                        {quiz.total_attempts !== undefined && (
                          <p className="flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-400">
                            <svg
                              className="h-4 w-4 opacity-70"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {quiz.total_attempts} plays
                          </p>
                        )}

                        {quiz.avg_score !== undefined && (
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-[10px] font-bold">
                            {Math.round(quiz.avg_score)}% avg
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 sm:opacity-0 group-hover:opacity-100 transition">
                        Take Challenge →
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-black dark:group-hover:bg-white transition" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && quizzes.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-900">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                No Quizzes Found
              </p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-32 border-t border-zinc-100 pt-12 dark:border-zinc-900">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xl font-black tracking-tighter">
                QUIZZY.
              </span>
              <span className="text-xs text-zinc-400">
                © 2026. All rights reserved.
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <a 
                href="https://www.instagram.com/vincentgavrilaa" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://github.com/VincentGavrila07" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Github
              </a>
              <a 
                href="https://www.linkedin.com/in/vincent-gavrila-apriliano-155246262/" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Crafted with precision by <span className="text-black dark:text-white">Vincent</span>
            </p>
            <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
              Next.js • Supabase • Framer Motion • TypeScript
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}