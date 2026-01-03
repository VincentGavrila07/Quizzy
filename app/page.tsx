"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./types/Quiz";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("/api/quiz");
        const data = await res.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quiz", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#050505] dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg sm:text-xl font-black tracking-tighter">
            QUIZZY.
          </span>

          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-500">
            <a className="hidden sm:block hover:text-black dark:hover:text-white transition-colors">
              Library
            </a>
            <button className="rounded-full bg-black px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-bold text-white dark:bg-white dark:text-black active:scale-95 transition">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 sm:pt-36 pb-24">
        
        {/* HERO */}
        <section className="relative mb-24 sm:mb-32">
          <div className="absolute -top-16 -left-16 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900/30 -z-10" />

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
              <button className="w-full sm:w-auto rounded-2xl bg-black px-8 py-4 font-bold text-white transition hover:scale-105 active:scale-95 dark:bg-white dark:text-black shadow-xl">
                Explore All Quizzes
              </button>
              <button className="w-full sm:w-auto rounded-2xl border border-zinc-200 px-8 py-4 font-bold transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                View Stats
              </button>
            </motion.div>
          </div>
        </section>

        {/* QUIZ LIST */}
        <section>
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
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
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
                  "
                >
                  <div>
                    <div className="mb-6 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-zinc-50 text-lg sm:text-xl font-black transition group-hover:bg-black group-hover:text-white dark:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-black">
                      {quiz.title.charAt(0)}
                    </div>

                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                      {quiz.title}
                    </h3>

                    <p className="mt-2 flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-400">
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
                      60s rounds
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 sm:opacity-0 group-hover:opacity-100 transition">
                      Take Challenge →
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-black dark:group-hover:bg-white transition" />
                  </div>
                </Link>
              ))}
            </div>
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
              <a href="https://www.instagram.com/vincentgavrilaa" className="hover:text-black dark:hover:text-white">Instagram</a>
              <a href="https://github.com/VincentGavrila07" className="hover:text-black dark:hover:text-white">Github</a>
              <a href="https://www.linkedin.com/in/vincent-gavrila-apriliano-155246262/" className="hover:text-black dark:hover:text-white">LinkedIn</a>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Crafted with precision by <span className="text-black dark:text-white">Vincent</span>
            </p>
            <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
              Next.js • Supabase • Framer Motion
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
