import { expect, test } from 'vitest';
import { checkMaster, validateWorkJson, type ValidatedWork } from './works-validate.ts';

// The importer's boundary: producer JSON and masters that would publish a broken or private work must be rejected.
const good = {
  title: { 'zh-hant': '雪祭', en: 'Snow Festival' },
  theme: 'daily',
  features: ['steps8', 'oneTake', 'sound', 'softvl2x'],
  run_id: '3f9a1c2b-77de-4e0a',
  seed: 20261118,
  seconds: 10.21,
  poster_at: 4.5,
  frames_source: 245,
  frames_delivered: 245,
  basecheck: { pass: true, notes: 'internal note' },
  notes: 'never copied',
  path: '/somewhere/private/out.mp4',
};

const valid = (raw: unknown = good) => {
  const result = validateWorkJson('snow-festival', raw);
  if (!result.ok) throw new Error(result.reason);
  return result;
};

test('accepts a good work, keeps only validated fields and shortens the run id', () => {
  const { value, warnings } = valid();
  expect(value.run).toBe('3f9a1c2b');
  expect(value.category).toBe('daily');
  expect(value.title.ja).toBe('Snow Festival');
  expect(value.jaFallback).toBe(true);
  expect(warnings.length).toBe(1);
  expect(JSON.stringify(value)).not.toMatch(/internal note|never copied|private/);
});

test('rejects a frame-count mismatch in the JSON', () => {
  const result = validateWorkJson('snow-festival', { ...good, frames_delivered: 244 });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toMatch(/frame count/);
});

test('rejects a master whose decoded frame count differs from the JSON', () => {
  const work: ValidatedWork = valid().value;
  const result = checkMaster(work, { width: 2560, height: 1472, frames: 241, fps: 24, hasAudio: true });
  expect(result.ok).toBe(false);
  const ok = checkMaster(work, { width: 1472, height: 2560, frames: 245, fps: 24, hasAudio: true });
  expect(ok.ok && ok.value.orientation).toBe('portrait');
});

test('rejects a failed or missing basecheck', () => {
  expect(validateWorkJson('snow-festival', { ...good, basecheck: { pass: false } }).ok).toBe(false);
  expect(validateWorkJson('snow-festival', { ...good, basecheck: { pass: 'true' } }).ok).toBe(false);
  const rest: Record<string, unknown> = { ...good };
  delete rest.basecheck;
  expect(validateWorkJson('snow-festival', rest).ok).toBe(false);
});

test.each([
  '/home/someone/out/snow.mp4',
  'C:\\renders\\snow',
  'snow_festival_final.mp4',
  'https://example.com/snow',
  '~/renders/snow',
  'render on 192.168.1.20',
])('rejects the path-like title %s', (title) => {
  expect(validateWorkJson('snow-festival', { ...good, title: { ...good.title, en: title } }).ok).toBe(false);
  expect(validateWorkJson('snow-festival', { ...good, title: { ...good.title, ja: title } }).ok).toBe(false);
});

test('rejects bad slugs, unknown categories and poster times outside the clip', () => {
  expect(validateWorkJson('../snow', good).ok).toBe(false);
  expect(validateWorkJson('Snow Festival', good).ok).toBe(false);
  expect(validateWorkJson('snow-festival', { ...good, theme: 'horror' }).ok).toBe(false);
  expect(validateWorkJson('snow-festival', { ...good, poster_at: 11 }).ok).toBe(false);
});
