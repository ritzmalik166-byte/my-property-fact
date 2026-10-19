// utils/sanitizeHtml.js
export function sanitizeHtml(html) {
  if (!html) return "";

  // remove style="..." inline css
  let cleanHtml = html.replace(/\s*style="[^"]*"/gi, "");

  // optional: remove <font> tags completely
  cleanHtml = cleanHtml.replace(/<\/?font[^>]*>/gi, "");

  // remove empty tags; whitespace-only tags (e.g. `<span> </span>` from pasted
  // rich text) are word separators, so keep a single space in their place
  cleanHtml = cleanHtml.replace(
    /<([a-z][a-z0-9]*)\b[^>]*>(\s*)<\/\1>/gi,
    (_, _tag, whitespace) => (whitespace ? " " : ""),
  );

  return cleanHtml;
}
