"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./types/Quiz";
import Link from "next/link";

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
      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-black tracking-tighter">QUIZZY.</span>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Library</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Leaderboard</a>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <button className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white dark:bg-white dark:text-black">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pt-40 pb-24">
        
        {/* HERO SECTION */}
        <section className="relative mb-32">
          <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900/50 -z-10" />
          <div className="max-w-4xl">
            <h1 className="mb-8 text-7xl font-black tracking-[ -0.04em] leading-[0.9] lg:text-8xl">
              Level up your <br />
              <span className="text-zinc-400 dark:text-zinc-600">intellect.</span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">
              Quizzy combines high-fidelity interactions with curated knowledge. 
              Experience the next generation of digital learning.
            </p>
            <div className="mt-10 flex gap-4">
              <button className="rounded-2xl bg-black px-8 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black">
                Explore All Quizzes
              </button>
              <button className="rounded-2xl border border-zinc-200 px-8 py-4 font-bold transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                View Stats
              </button>
            </div>
          </div>
        </section>

        {/* QUIZ LIST SECTION */}
        <section>
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Curated Selection</h2>
              <h3 className="mt-2 text-4xl font-bold tracking-tight">Available Quizzes</h3>
            </div>
            <div className="hidden h-px flex-1 bg-zinc-100 mx-12 mb-3 dark:bg-zinc-900 md:block" />
            <span className="text-sm font-bold text-zinc-400">{quizzes.length} Total</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-zinc-50 dark:bg-zinc-900/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/quiz/${quiz.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-zinc-100 bg-white p-8 transition-all hover:-translate-y-2 hover:border-black hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:border-zinc-900 dark:bg-[#0A0A0A] dark:hover:border-white dark:hover:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.05)]"
                >
                  <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-xl group-hover:bg-black group-hover:text-white transition-colors dark:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-black">
                      {quiz.title.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight leading-snug">
                      {quiz.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium text-zinc-400">
                      {quiz.questions?.length || 0} Questions • 60s per turn
                    </p>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-widest opacity-0 transition-all group-hover:opacity-100">
                      Start Quiz →
                    </span>
                    <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-black dark:group-hover:bg-white" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && quizzes.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-900">
              <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">No Quizzes Found</p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-40 border-t border-zinc-100 pt-12 dark:border-zinc-900">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <span className="text-lg font-black tracking-tighter">QUIZZY.</span>
              <span className="text-sm text-zinc-400">© 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Github</a>
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Crafted with precision by <span className="text-black dark:text-white">Vincent</span>
          </p>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
            Built with Next.js, Supabase & Framer Motion.
          </p>
        </footer>
      </main>
    </div>
  );
}