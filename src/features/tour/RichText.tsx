import { Fragment } from 'react';

const TOKEN = /(\[\[[^\]]+\]\]|`[^`]+`)/g;

/**
 * Inline markup used in the Tour copy:
 * - `[[Label]]`: an exact English UI label, set as a quiet label chip with `lang="en"` (the recordings and captures use the
 *   English UI in every locale);
 * - `` `id` ``: a component id, tool name or literal value, set in mono.
 * Everything else is plain text. Chips wrap with the line (box-decoration-break) so long labels never overflow on phones.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          return (
            <span key={index} lang="en" className="tour-ui-label">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} translate="no" className="tour-code">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

/** The same text without markup, for accessible names and titles. */
export function plainText(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, '“$1”').replace(/`([^`]+)`/g, '$1');
}
