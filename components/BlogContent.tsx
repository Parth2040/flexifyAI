import { Fragment, type ReactNode } from "react";

/**
 * Renders the markdown-lite blog content:
 *   `## `  → h2
 *   `### ` → h3
 *   `- `   → bulleted list item (consecutive items grouped)
 *   blank line separates paragraphs
 */
export default function BlogContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    nodes.push(
      <ul key={key++} className="list-disc pl-6 my-4 space-y-1.5 text-mist marker:text-gold">
        {items.map((it, i) => (
          <li key={i} className="leading-relaxed">
            {it}
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <h3 key={key++} className="font-serif text-xl font-semibold text-parchment mt-8 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2 key={key++} className="font-serif text-2xl md:text-3xl font-semibold text-parchment mt-10 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else {
      flushList();
      nodes.push(
        <p key={key++} className="text-mist leading-relaxed my-4">
          {line}
        </p>
      );
    }
  }
  flushList();

  return <Fragment>{nodes}</Fragment>;
}
