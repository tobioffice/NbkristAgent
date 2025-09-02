export function sanitizeMarkdown(text: string): string {
  // Use a regular expression to find and fix unclosed bold tags
  // This pattern matches a `*` followed by a space, which is likely a bullet point
  // or a mistaken start of a bold tag. We will replace it with a simple bullet.
  text = text.replace(/(^|\n|\s)\*([^*\s][^*]*?)\s*$/gm, "$1• $2");

  // Find and replace bold tags (`*...*` or `**...**`) that are not properly closed
  // This finds a single asterisk not followed immediately by another asterisk or a space,
  // and replaces it with a simple bullet point.
  text = text.replace(/(?<!\*)\*(?!\*)/g, "•");

  // Ensure that all bold tags are correctly formed with double asterisks `**`
  // This will correct single asterisks that were meant for bolding but were mistyped.
  text = text.replace(/\*\*(.*?)\*\*/g, "**$1**");

  // Convert `*` bullet points at the start of a line to `•`
  text = text.replace(/^\s*\*\s+/gm, "• ");

  return text;
}
