/** Match `/properties/<slug>` plus the same path on an absolute URL. */
const PROPERTY_PATH_RE =
  /(?:https?:\/\/[^\s)<]+)\/properties\/[a-z0-9]+(?:-[a-z0-9]+)*|\/properties\/[a-z0-9]+(?:-[a-z0-9]+)*/gi;

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export function listingPathFromMatch(raw: string): string | null {
  const match = raw.match(/\/properties\/[a-z0-9]+(?:-[a-z0-9]+)*/i);
  return match ? match[0].toLowerCase() : null;
}

/** Turn bare listing paths into markdown links without rewriting existing ones. */
export function linkifySunnyMarkdown(text: string): string {
  const saved: string[] = [];
  const protectedText = text.replace(MARKDOWN_LINK_RE, (block) => {
    saved.push(block);
    return `\0MD${saved.length - 1}\0`;
  });
  const linked = protectedText.replace(PROPERTY_PATH_RE, (raw) => {
    const href = listingPathFromMatch(raw);
    if (!href) return raw;
    return `[${href}](${href})`;
  });
  return linked.replace(/\0MD(\d+)\0/g, (_, index: string) => saved[Number(index)] ?? '');
}

/** Keep single newlines as markdown hard breaks so chat replies do not collapse. */
export function withMarkdownBreaks(text: string): string {
  return text.replace(/([^\n])\n(?!\n)/g, '$1  \n');
}

export function prepareSunnyMarkdown(text: string): string {
  return withMarkdownBreaks(linkifySunnyMarkdown(text));
}
