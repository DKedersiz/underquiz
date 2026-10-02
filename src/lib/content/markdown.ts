import "server-only";
import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

// Content is authored by us and rendered at build time, so the HTML is trusted.
let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["java", "sql", "yaml", "properties", "json"],
  });
  return highlighter;
}

type CodeToken = Tokens.Code & { highlighted?: string };

const marked = new Marked({
  async: true,
  gfm: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const code = token as CodeToken;
    const hl = await getHighlighter();
    const lang = hl.getLoadedLanguages().includes(code.lang ?? "") ? code.lang! : "text";
    code.highlighted = hl.codeToHtml(code.text, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  },
  renderer: {
    code(token) {
      return (token as CodeToken).highlighted ?? `<pre><code>${token.text}</code></pre>`;
    },
  },
});

export async function renderBlock(md: string): Promise<string> {
  return marked.parse(md);
}

export async function renderInline(md: string): Promise<string> {
  return marked.parseInline(md);
}
