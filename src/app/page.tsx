"use client";

import { useState } from "react";

const contentTypes = [
  "Blog Post",
  "Article",
  "Social Media Post",
  "Professional Email",
  "Product Description",
];

export default function Home() {
  const [type, setType] = useState("Blog Post");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");

  function createDraft() {
    if (!topic.trim()) return;

    setContent(
      `# ${topic}\n\n` +
        `Content type: ${type}\n\n` +
        `This is your Creovio writing workspace. Your generated content will appear here.`
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-bold">CREOVIO</h1>
          <p className="mt-2 text-zinc-400">Create. Improve. Publish.</p>
        </header>

        <section className="py-8">
          <h2 className="text-3xl font-bold">Create Content</h2>
          <p className="mt-2 text-zinc-400">
            Tell Creovio what you want to create.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <label className="mb-3 block text-sm font-medium">
              Content type
            </label>

            <div className="flex flex-wrap gap-2">
              {contentTypes.map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    type === item
                      ? "bg-white text-black"
                      : "border border-zinc-700 text-zinc-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-6 mb-3 block text-sm font-medium">
              What do you want to create?
            </label>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: Write a blog post about how small businesses can use social media..."
              className="min-h-32 w-full rounded-xl border border-zinc-700 bg-black p-4 text-white outline-none placeholder:text-zinc-600"
            />

            <button
              onClick={createDraft}
              className="mt-4 rounded-xl bg-white px-6 py-3 font-bold text-black"
            >
              Create Draft
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-2xl font-bold">Your Content</h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your content will appear here..."
            className="mt-4 min-h-80 w-full rounded-xl border border-zinc-700 bg-black p-5 text-white outline-none placeholder:text-zinc-600"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-xl border border-zinc-700 px-5 py-3">
              Improve
            </button>

            <button className="rounded-xl border border-zinc-700 px-5 py-3">
              Make Professional
            </button>

            <button className="rounded-xl border border-zinc-700 px-5 py-3">
              Shorten
            </button>

            <button className="rounded-xl border border-zinc-700 px-5 py-3">
              Expand
            </button>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-zinc-600">
          © 2026 Creovio
        </footer>
      </div>
    </main>
  );
}
