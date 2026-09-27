"use client";

import { useRef, useState } from "react";
import Markdown from "@/app/components/Markdown";

// Create-post editor with a Markdown formatting toolbar and live preview.
// Content is stored as Markdown and rendered via the shared <Markdown/>.
export default function PostEditor({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Wrap the current selection with `before`/`after` (e.g. **bold**).
  function surround(before: string, after: string, placeholder: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = content.slice(s, e) || placeholder;
    const next = content.slice(0, s) + before + sel + after + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  // Prefix each selected line (e.g. "## ", "> ", "- ").
  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = content.lastIndexOf("\n", s - 1) + 1;
    const block = content.slice(lineStart, e);
    const prefixed = block
      .split("\n")
      .map((l) => (l.startsWith(prefix) ? l : prefix + l))
      .join("\n");
    const next = content.slice(0, lineStart) + prefixed + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  }

  function insertLink() {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const text = content.slice(s, e) || "link text";
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    const md = `[${text}](${url})`;
    const next = content.slice(0, s) + md + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1 + text.length);
    });
  }

  async function submit() {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post");
      }
      setTitle("");
      setContent("");
      setTab("write");
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const toolBtn =
    "px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition-colors disabled:opacity-40";

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 font-body transition-colors focus:border-gray-400 focus:outline-none"
        placeholder="Title"
        disabled={posting}
      />

      {/* Toolbar + Write/Preview tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-gray-300 bg-gray-50 px-2 py-1.5">
        <button type="button" className={`${toolBtn} font-bold`} onClick={() => surround("**", "**", "bold text")} disabled={posting} title="Bold">
          B
        </button>
        <button type="button" className={`${toolBtn} italic`} onClick={() => surround("*", "*", "italic text")} disabled={posting} title="Italic">
          I
        </button>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <button type="button" className={toolBtn} onClick={() => linePrefix("## ")} disabled={posting} title="Heading">
          H
        </button>
        <button type="button" className={toolBtn} onClick={() => linePrefix("> ")} disabled={posting} title="Quote">
          ❝
        </button>
        <button type="button" className={toolBtn} onClick={() => linePrefix("- ")} disabled={posting} title="Bullet list">
          •
        </button>
        <button type="button" className={toolBtn} onClick={() => linePrefix("1. ")} disabled={posting} title="Numbered list">
          1.
        </button>
        <button type="button" className={toolBtn} onClick={insertLink} disabled={posting} title="Link">
          🔗
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === "write" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === "preview" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-y rounded-b-xl border border-gray-300 px-4 py-3 font-body focus:border-gray-400 focus:outline-none"
          rows={10}
          placeholder="What's on your mind?  (Markdown supported — use the toolbar above)"
          disabled={posting}
        />
      ) : (
        <div className="min-h-[16rem] rounded-b-xl border border-gray-300 bg-white px-4 py-3">
          {content.trim() ? (
            <Markdown>{content}</Markdown>
          ) : (
            <p className="font-body text-sm text-gray-400">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <p className="mt-2 font-body text-xs text-gray-400">
        Formatting: **bold**, *italic*, ## heading, &gt; quote, - list, [links](url). Blank line = new paragraph.
      </p>

      {error && <p className="mt-2 font-body text-sm text-red-500">{error}</p>}

      <button
        onClick={submit}
        disabled={posting || !title.trim() || !content.trim()}
        className="mt-5 w-full rounded-xl bg-[#1a1a1a] py-3 font-body text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {posting ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
