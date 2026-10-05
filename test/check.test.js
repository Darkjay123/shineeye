import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moneyMath, formatNaira, formatCount } from '../src/money.js';
import { check } from '../src/check.js';
import * as F from './fixtures.js';

const ids = (r) => r.flags.map((f) => f.id).sort();

test('doubling every month gives 4,096x and ₦409.6 million', () => {
  const m = moneyMath(F.ENGLISH_DOUBLE);
  assert.equal(m.quote, 'Double your money every month');
  assert.equal(Math.round(m.multiple), 4096);
  assert.equal(formatNaira(m.final), '₦409.6 million');
  assert.equal(m.newcomers, 4095);
});

test('English broadcast is high risk with every flag quoted from the text', () => {
  const r = check(F.ENGLISH_DOUBLE);
  assert.equal(r.verdict, 'high');
  assert.deepEqual(ids(r), ['guaranteed', 'high_return', 'payment', 'referral', 'registration', 'trading', 'urgency', 'withdrawal']);
  for (const f of r.flags) assert.equal(F.ENGLISH_DOUBLE.slice(f.start, f.end), f.quote);
});

test('Pidgin pitch: invest 50k get 100k after 14 days is detected', () => {
  const r = check(F.PIDGIN);
  assert.equal(r.math.quote, 'Invest 50k get 100k after 14 days');
  assert.ok(r.math.monthlyRate > 3); // 100% per 14 days compounds to over 300% a month
  assert.equal(r.verdict, 'high');
  for (const id of ['guaranteed', 'trading', 'urgency', 'testimonials', 'withdrawal']) assert.ok(ids(r).includes(id), id);
});

test('30% weekly converts to a monthly rate above 200%', () => {
  const m = moneyMath(F.WEEKLY_PCT);
  assert.ok(Math.abs(m.monthlyRate - (Math.pow(1.3, 30 / 7) - 1)) < 1e-9);
  assert.equal(check(F.WEEKLY_PCT).verdict, 'high');
});

test('daily profit of 5% is found and huge numbers are formatted in words', () => {
  const m = moneyMath(F.DAILY_PCT);
  assert.equal(m.quote, 'Daily profit of 5%');
  assert.equal(formatNaira(m.final), '₦4.2 trillion'); // 1.05^360 ≈ 42 million times
  assert.match(formatCount(m.newcomers), /^42\.\d million$/);
  assert.equal(formatNaira(1e18), '₦1,000+ trillion');
  assert.ok(ids(check(F.DAILY_PCT)).includes('payment'));
  assert.ok(ids(check(F.DAILY_PCT)).includes('withdrawal'));
});

test('Pidgin "go turn" and "will triple" phrasings', () => {
  assert.equal(moneyMath(F.TURN_INTO).quote, 'Your 50k go turn 150k in 2 weeks'.replace('Your ', ''));
  assert.equal(moneyMath(F.TRIPLE).quote, 'money will triple in 3 weeks');
  assert.ok(ids(check(F.TRIPLE)).includes('referral'));
});

test('a modest 5% monthly mention is not flagged as too high', () => {
  const r = check(F.MILD);
  assert.ok(!ids(r).includes('high_return'));
  assert.notEqual(r.verdict, 'high');
});

test('an ordinary message has no flags and no math', () => {
  const r = check(F.CLEAN);
  assert.equal(r.verdict, 'none');
  assert.equal(r.math, null);
  assert.equal(r.flags.length, 0);
});
