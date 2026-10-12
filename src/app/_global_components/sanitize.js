// utils/sanitizeHtml.js
export function sanitizeHtml(html) {
  if (!html) return "";

  // remove style="..." inline css
  let cleanHtml = html.replace(/\s*style="[^"]*"/gi, "");

  // optional: remove <font> tags completely
  cleanHtml = cleanHtml.replace(/<\/?font[^>]*>/gi, "");

  // optional: remove empty tags
  cleanHtml = cleanHtml.replace(/<([a-z][a-z0-9]*)\b[^>]*>\s*<\/\1>/gi, "");

  return cleanHtml;
}
