import { moneyMath } from './money.js';
import { findFlags } from './flags.js';

export const HIGH_MONTHLY = 0.10; // above 10% a month is flagged as too high

export function verdictFor(flags) {
  const ids = new Set(flags.map((f) => f.id));
  const strong = ids.has('high_return') || ids.has('guaranteed');
  if ((strong && flags.length >= 2) || flags.length >= 3) return 'high';
  if (flags.length >= 1) return 'careful';
  return 'none';
}

export function check(text, extraFlags = []) {
  const math = moneyMath(text);
  const flags = [];
  if (math && math.monthlyRate > HIGH_MONTHLY) {
    flags.push({ id: 'high_return', quote: math.quote, start: math.start, end: math.end, source: 'rules' });
  }
  flags.push(...findFlags(text), ...extraFlags);
  flags.sort((a, b) => a.start - b.start);
  return { verdict: verdictFor(flags), math, flags };
}
