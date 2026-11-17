// Minimal WebVTT reader for the site's own caption files (cue timings + text; settings and styling are ignored).

export interface Cue {
  start: number;
  end: number;
  text: string;
}

function seconds(stamp: string): number {
  const parts = stamp.trim().split(':').map(Number);
  const [h, m, s] = parts.length === 3 ? parts : [0, ...parts];
  return (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
}

export function parseVtt(source: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of source.replace(/\r/g, '').split(/\n{2,}/)) {
    const lines = block.split('\n').filter((line) => line.trim() !== '');
    const timing = lines.findIndex((line) => line.includes('-->'));
    if (timing < 0) continue;
    const [from = '', to = ''] = (lines[timing] ?? '').split('-->');
    const text = lines
      .slice(timing + 1)
      .join('\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (text) cues.push({ start: seconds(from), end: seconds(to.trim().split(/\s+/)[0] ?? ''), text });
  }
  return cues;
}

/** The cue showing at `time`, if any. Cues are few, so a linear scan is fine. */
export function activeCue(cues: readonly Cue[], time: number): Cue | undefined {
  return cues.find((cue) => time >= cue.start && time < cue.end);
}
