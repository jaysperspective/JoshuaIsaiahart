import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";

// Shared Markdown renderer for blog posts. Styled to the editorial system.
// Safe by default — react-markdown renders React elements, no raw HTML.
const components: Components = {
  p: ({ children }) => (
    <p className="mb-4 font-sans text-sm leading-relaxed text-ink-soft last:mb-0">{children}</p>
  ),
  h1: ({ children }) => (
    <h3 className="headline mb-3 mt-6 text-[1.4rem] first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="headline mb-3 mt-6 text-[1.25rem] first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 mt-5 font-display text-lg font-medium text-emerald first:mt-0">{children}</h4>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link-underline">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-5 list-disc space-y-1 font-sans text-sm leading-relaxed text-ink-soft">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1 font-sans text-sm leading-relaxed text-ink-soft">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-accent pl-4 font-display text-base italic text-ink-soft">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">{children}</code>
  ),
  hr: () => <hr className="rule my-6" />,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
