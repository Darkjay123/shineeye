// Red-flag rules. Each finds the exact words in the pitch so the warning can quote them.

export const RULES = [
  {
    id: 'guaranteed',
    re: /\b(guarantee[ds]?|guaranteed (?:returns?|profit|income)|risk[- ]?free|no risk|zero risk|100% (?:safe|sure|secure|guaranteed)|cannot lose|can'?t lose|no loss|no fit lose|e sure pass|sure (?:money|profit|banker))\b/i,
  },
  {
    id: 'referral',
    re: /\b(referrals?|refer(?:\s+\d+)?(?:\s+(?:people|persons|friends))?|referral bonus|invite \d+|bring \d+(?:\s+(?:people|persons|friends))?|introduce \d+|downlines?|upline|recruit(?:ing)?|commission on (?:every|each)\s+\w+|for every person you bring)\b/i,
  },
  {
    id: 'urgency',
    re: /\b(limited (?:slots?|spaces?|offer)|only \d+ slots?(?: left| remaining)?|slots? (?:remaining|left|closing|dey finish|don almost finish)|closes? (?:today|tonight|soon|by midnight)|today only|last chance|hurry(?: up)?|don'?t miss (?:out|this)|before (?:e|it|slots?) close|act (?:now|fast)|offer ends)\b/i,
  },
  {
    id: 'trading',
    re: /\b(trading bots?|ai trading|robot trading|forex trading|forex|arbitrage|crypto mining|mining pool|auto[- ]?trad(?:e|ing)|binary options?|expert traders?)\b/i,
  },
  {
    id: 'withdrawal',
    re: /\b(withdraw(?:al)?s?\s+(?:only\s+)?(?:after|from|on|every)\s+[\w ]{1,20}?(?=[.,!\n]|$)|upgrade (?:your account )?to withdraw|pay (?:a |small )?(?:fee|tax|charge) (?:to|before you) withdraw|withdrawal fee|unlock (?:your )?withdrawal|minimum withdrawal|lock(?:ed)? (?:for|period of) \d+ \w+)/i,
  },
  {
    id: 'payment',
    re: /\b(pay (?:in)?to (?:this|my|the following) (?:account|number|wallet)|send (?:to|into) (?:this|my) (?:account|wallet)|account (?:number|no\.?|details?)\s*:?\s*\d{6,}|usdt\s*\(?trc ?20\)?(?: address)?|wallet address)/i,
  },
  {
    id: 'registration',
    re: /\b(registered with (?:cac|sec|the cac)|cac (?:registered|certified|number|reg(?:istration)?(?: no\.?| number)?)|rc ?\d{5,}|fully registered|licensed by \w+|approved by (?:cbn|sec)|sec (?:registered|approved))\b/i,
  },
  {
    id: 'testimonials',
    re: /\b(testimon(?:y|ies|ials?)|payment proofs?|proofs? of payment|withdrawal proofs?|i (?:just )?got paid|e don pay me|members (?:are|dey) (?:cashing out|smiling|collecting))\b/i,
  },
];

export function findFlags(text) {
  const out = [];
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (m) out.push({ id: rule.id, quote: m[0].trim(), start: m.index, end: m.index + m[0].length, source: 'rules' });
  }
  return out;
}
