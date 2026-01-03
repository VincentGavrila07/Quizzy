"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./types/Quiz";

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
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <main className="mx-auto max-w-6xl px-6 py-24">
        
        {/* HERO */}
        <section className="mb-24 max-w-3xl">
          <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight">
            Minimal Quiz Platform
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            A clean, elegant quiz application built with Next.js, Supabase,
            and modern web architecture. Designed for clarity, performance,
            and scalability.
          </p>
        </section>

        {/* QUIZ LIST */}
        <section>
          <h2 className="mb-8 text-2xl font-medium tracking-tight">
            Available Quizzes
          </h2>

          {loading && (
            <p className="text-zinc-500">Loading quizzes...</p>
          )}

          {!loading && quizzes.length === 0 && (
            <p className="text-zinc-500">No quizzes available.</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="group rounded-xl border border-zinc-200 p-6 transition-all hover:border-black dark:border-zinc-800 dark:hover:border-white"
              >
                <h3 className="mb-2 text-xl font-medium">
                  {quiz.title}
                </h3>

                <a
                  href={`/quiz/${quiz.id}`}
                  className="inline-block text-sm font-medium underline-offset-4 transition-all group-hover:underline"
                >
                  Start Quiz
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-32 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800">
          Built by Vincent With Next.js + Supabase
        </footer>

      </main>
    </div>
  );
}
