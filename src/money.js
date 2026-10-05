// Finds the return a pitch promises and works out what it would mean over 12 months.

const UNIT_DAYS = { hour: 1 / 24, day: 1, week: 7, month: 30 };

function unitOf(word) {
  const w = word.toLowerCase();
  if (w.startsWith('hour')) return 'hour';
  if (w.startsWith('day') || w === 'daily') return 'day';
  if (w.startsWith('week')) return 'week';
  return 'month';
}

function parseNaira(num, k) {
  const n = Number(String(num).replace(/,/g, ''));
  return k ? n * 1000 : n;
}

// Each rule returns { gain, days } meaning "gain (as a fraction) over `days` days".
const RULES = [
  // "30% weekly", "5% per day", "40% every month", "10%/day", "20% ROI weekly"
  {
    re: /(\d+(?:\.\d+)?)\s?%\s*(?:roi|profit|returns?|interest)?\s*(?:per|a|every|each|\/)?\s*(hours?|days?|daily|weeks?|weekly|months?|monthly)\b/gi,
    read: (m) => ({ gain: Number(m[1]) / 100, days: UNIT_DAYS[unitOf(m[2])] }),
  },
  // "40% in 30 days", "50% profit within 2 weeks", "20% after 48 hours"
  {
    re: /(\d+(?:\.\d+)?)\s?%\s*(?:roi|profit|returns?|interest|gain)?\s*(?:in|within|after|for)\s*(\d+)\s*(hours?|days?|weeks?|months?)\b/gi,
    read: (m) => ({ gain: Number(m[1]) / 100, days: Number(m[2]) * UNIT_DAYS[unitOf(m[3])] }),
  },
  // "daily profit of 5%", "weekly ROI 15%"
  {
    re: /\b(daily|weekly|monthly)\s+(?:profit|returns?|roi|interest)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s?%/gi,
    read: (m) => ({ gain: Number(m[2]) / 100, days: UNIT_DAYS[unitOf(m[1])] }),
  },
  // "double your money in 30 days", "2x your investment within 2 weeks", "money go double for 14 days"
  {
    re: /\b(double|triple|2x|3x)\s*(?:your\s*(?:money|investment|capital|funds?))?\s*(?:in|within|after|for)\s*(\d+)\s*(hours?|days?|weeks?|months?)\b/gi,
    read: (m) => ({ gain: /triple|3x/i.test(m[1]) ? 2 : 1, days: Number(m[2]) * UNIT_DAYS[unitOf(m[3])] }),
  },
  // "double your money every month", "doubles monthly", "2x weekly"
  {
    re: /\b(doubles?|triples?|2x|3x)\s*(?:your\s*(?:money|investment|capital|funds?))?\s*(?:every|each|per|a)?\s*(month|monthly|week|weekly|day|daily)\b/gi,
    read: (m) => ({ gain: /triple|3x/i.test(m[1]) ? 2 : 1, days: UNIT_DAYS[unitOf(m[2])] }),
  },
  // Pidgin: "your money go double for 30 days", "am go triple in 2 weeks"
  {
    re: /\b(?:money|investment|capital|am)\s+(?:go|will)\s+(double|triple)\s*(?:for|in|within|after)\s*(\d+)\s*(hours?|days?|weeks?|months?)\b/gi,
    read: (m) => ({ gain: m[1].toLowerCase() === 'triple' ? 2 : 1, days: Number(m[2]) * UNIT_DAYS[unitOf(m[3])] }),
  },
  // "invest 50k get 100k after 14 days", "pay ₦20,000 collect ₦35,000 in 7 days"
  {
    re: /\b(?:invest|pay|put|drop|deposit)\s*(?:in\s*)?₦?\s?(\d[\d,]*)\s*(k)?\s*(?:,|and|&|then)?\s*(?:get|collect|receive|withdraw|earn|cash ?out)\s*₦?\s?(\d[\d,]*)\s*(k)?\s*(?:in|within|after|for)\s*(\d+)\s*(hours?|days?|weeks?|months?)\b/gi,
    read: (m) => {
      const a = parseNaira(m[1], m[2]);
      const b = parseNaira(m[3], m[4]);
      return a > 0 && b > a ? { gain: b / a - 1, days: Number(m[5]) * UNIT_DAYS[unitOf(m[6])] } : null;
    },
  },
  // "your 50k go turn 100k in 2 weeks", "100k becomes 250k within 30 days"
  {
    re: /₦?\s?(\d[\d,]*)\s*(k)?\s+(?:go\s+)?(?:turn(?:s)?(?:\s+to)?|become(?:s)?|grow(?:s)?\s+to|into)\s+₦?\s?(\d[\d,]*)\s*(k)?\s*(?:in|within|after|for)\s*(\d+)\s*(hours?|days?|weeks?|months?)\b/gi,
    read: (m) => {
      const a = parseNaira(m[1], m[2]);
      const b = parseNaira(m[3], m[4]);
      return a > 0 && b > a ? { gain: b / a - 1, days: Number(m[5]) * UNIT_DAYS[unitOf(m[6])] } : null;
    },
  },
];

export const START = 100_000;

export function findPromises(text) {
  const found = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text))) {
      const r = rule.read(m);
      if (!r || !(r.days > 0) || !(r.gain > 0)) continue;
      const monthly = Math.pow(1 + r.gain, 30 / r.days) - 1;
      found.push({ quote: m[0].trim(), start: m.index, end: m.index + m[0].length, monthly });
    }
  }
  return found;
}

export function moneyMath(text) {
  const promises = findPromises(text);
  if (promises.length === 0) return null;
  // The worst (highest) promise is the one that matters.
  const p = promises.reduce((a, b) => {
    if (Math.abs(b.monthly - a.monthly) < 1e-9) return b.quote.length > a.quote.length ? b : a; // same promise: keep the fuller quote
    return b.monthly > a.monthly ? b : a;
  });
  const multiple = Math.pow(1 + p.monthly, 12);
  const final = START * multiple;
  return {
    quote: p.quote,
    start: p.start,
    end: p.end,
    monthlyRate: p.monthly,
    multiple,
    start_amount: START,
    final,
    newcomers: Math.max(0, Math.round(multiple - 1)),
  };
}

export function formatNaira(n) {
  if (!Number.isFinite(n) || n > 1e15) return '₦1,000+ trillion';
  const units = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
  ];
  for (const [v, word] of units) {
    if (n >= v) {
      const x = n / v;
      const s = x >= 1000 ? Math.round(x).toLocaleString('en-US') : x.toFixed(1).replace(/\.0$/, '');
      return `₦${s} ${word}`;
    }
  }
  return `₦${Math.round(n).toLocaleString('en-US')}`;
}

export function formatCount(n) {
  if (!Number.isFinite(n) || n > 1e12) return 'more than a trillion';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, '')} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')} million`;
  return Math.round(n).toLocaleString('en-US');
}
