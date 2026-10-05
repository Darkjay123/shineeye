import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiFlags, keepRealQuotes } from '../src/ai.js';
import { check } from '../public/lib/check.js';

const PITCH = 'Join Goldleaf today. Our CEO is a former Shell engineer. Double your money every month, 100% guaranteed.';

test('an AI flag survives only if its quote is really in the message', () => {
  const kept = keepRealQuotes(PITCH, [
    { label: 'Borrowed credibility', why: 'A famous employer is not proof.', quote: 'former Shell engineer' },
    { label: 'Invented', why: 'This quote is not in the message.', quote: 'approved by the CBN governor' },
  ]);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].quote, 'former Shell engineer');
  assert.equal(PITCH.slice(kept[0].start, kept[0].end), 'former Shell engineer');
});

test('an AI flag that overlaps a rules flag is dropped', () => {
  const base = check(PITCH).flags;
  const kept = keepRealQuotes(PITCH, [{ label: 'Dup', why: 'x', quote: '100% guaranteed' }], base);
  assert.equal(kept.length, 0);
});

test('no key means no AI call and no change', async () => {
  delete process.env.GEMINI_API_KEY;
  let called = false;
  const out = await aiFlags(PITCH, [], async () => { called = true; });
  assert.equal(called, false);
  assert.deepEqual(out, []);
});

test('with a key, a model reply is parsed and validated; failures return nothing', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  const reply = { candidates: [{ content: { parts: [{ text: JSON.stringify([{ label: 'Borrowed credibility', why: 'w', quote: 'former Shell engineer' }, { label: 'Fake', why: 'w', quote: 'not here' }]) }] } }] };
  const ok = await aiFlags(PITCH, [], async (url, opts) => {
    assert.equal(opts.headers['x-goog-api-key'], 'test-key');
    return { ok: true, json: async () => reply };
  });
  assert.deepEqual(ok.map((f) => f.quote), ['former Shell engineer']);
  assert.deepEqual(await aiFlags(PITCH, [], async () => { throw new Error('network'); }), []);
  assert.deepEqual(await aiFlags(PITCH, [], async () => ({ ok: false })), []);
  delete process.env.GEMINI_API_KEY;
});
