"use client";

import { useEffect, useState } from "react";

const contentTypes = [
  "Blog Post",
  "Article",
  "Social Media Post",
  "Professional Email",
  "Product Description",
];

const actions = [
  { label: "Improve", value: "improve" },
  { label: "Make Professional", value: "professional" },
  { label: "Shorten", value: "shorten" },
  { label: "Expand", value: "expand" },
];

export default function Home() {
  const [type, setType] = useState("Blog Post");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  const characterCount = content.length;

  useEffect(() => {
    const saved = localStorage.getItem("creovio-history");

    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  function saveHistory(text: string) {
    const updated = [
      text,
      ...history.filter((item) => item !== text),
    ].slice(0, 5);

    setHistory(updated);
    localStorage.setItem("creovio-history", JSON.stringify(updated));
  }

  async function generate(action = "create") {
    if (action === "create" && !topic.trim()) {
      setMessage("Please tell Creovio what you want to create.");
      return;
    }

    if (action !== "create" && !content.trim()) {
      setMessage("Create some content first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          topic,
          content,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setContent(data.content || "");
      saveHistory(data.content || "");

      setMessage(
        action === "create"
          ? "Draft created successfully."
          : `${actions.find((item) => item.value === action)?.label} complete.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate content."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyContent() {
    if (!content.trim()) {
      setMessage("There is no content to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setMessage("Content copied to clipboard.");
    } catch {
      setMessage("Could not copy the content.");
    }
  }

  function downloadContent() {
    if (!content.trim()) {
      setMessage("There is no content to download.");
      return;
    }

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "creovio-content.txt";
    link.click();

    URL.revokeObjectURL(url);

    setMessage("Content downloaded.");
  }

  function clearWorkspace() {
    setTopic("");
    setContent("");
    setMessage("");
  }

  function loadHistory(item: string) {
    setContent(item);
    setMessage("Draft loaded from history.");
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("creovio-history");
    setMessage("History cleared.");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">

        <header className="border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                CREOVIO
              </h1>

              <p className="mt-2 text-zinc-400">
                Create. Improve. Publish.
              </p>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              DEMO AI
            </span>
          </div>
        </header>

        <section className="py-8">
          <h2 className="text-3xl font-bold">Creovio Studio</h2>

          <p className="mt-2 text-zinc-400">
            Create professional content in seconds.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

            <label className="mb-3 block text-sm font-medium">
              Content type
            </label>

            <div className="flex flex-wrap gap-2">
              {contentTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`rounded-xl px-4 py-3 text-sm transition ${
                    type === item
                      ? "bg-white text-black"
                      : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mb-3 mt-6 block text-sm font-medium">
              What do you want to create?
            </label>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: How small businesses in Nigeria can use social media to get more customers..."
              className="min-h-36 w-full resize-y rounded-xl border border-zinc-700 bg-black p-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-400"
            />

            <button
              type="button"
              onClick={() => generate("create")}
              disabled={loading}
              className="mt-4 rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Create Draft"}
            </button>

            {message && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                {message}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                Your Content
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Edit your content directly.
              </p>
            </div>

            <span className="text-xs text-zinc-600">
              {type}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your content will appear here..."
            className="mt-4 min-h-96 w-full resize-y rounded-xl border border-zinc-700 bg-black p-5 leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-400"
          />

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => generate(action.value)}
                disabled={loading || !content.trim()}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium transition hover:border-zinc-400 disabled:opacity-40"
              >
                {loading ? "Working..." : action.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-800 pt-4">

            <button
              type="button"
              onClick={copyContent}
              disabled={!content.trim()}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-40"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={downloadContent}
              disabled={!content.trim()}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium disabled:opacity-40"
            >
              Download
            </button>

            <button
              type="button"
              onClick={clearWorkspace}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium hover:border-red-500 hover:text-red-400"
            >
              Clear
            </button>

          </div>
        </section>

        {history.length > 0 && (
          <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Drafts
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your last five generated drafts.
                </p>
              </div>

              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                Clear history
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {history.map((item, index) => (
                <button
                  key={`${index}-${item.slice(0, 20)}`}
                  type="button"
                  onClick={() => loadHistory(item)}
                  className="block w-full rounded-xl border border-zinc-800 p-3 text-left text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                >
                  {item.slice(0, 120)}
                  {item.length > 120 ? "..." : ""}
                </button>
              ))}
            </div>

          </section>
        )}

        <footer className="py-8 text-center text-sm text-zinc-600">
          © 2026 Creovio · Create. Improve. Publish.
        </footer>

      </div>
    </main>
  );
}
