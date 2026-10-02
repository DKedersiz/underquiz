// Renders HTML produced at build time from our own content files (trusted input).
export function Html({ html, inline, className = "" }: { html: string; inline?: boolean; className?: string }) {
  const Tag = inline ? "span" : "div";
  return <Tag className={`${inline ? "md-inline" : "md"} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
