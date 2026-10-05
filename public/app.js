import { COPY } from './copy.js';
import { EXAMPLES } from './examples.js';
import { formatNaira, formatCount } from './lib/money.js';
import { check } from './lib/check.js';

const $ = (s) => document.querySelector(s);
const text = $('#text');
const go = $('#go');
let lang = localStorage.getItem('shineeye-lang') || 'pcm';
let result = null;
let checkedText = '';

const c = () => COPY[lang];

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

function mathView(m) {
  return {
    quote: m.quote,
    final: formatNaira(m.final),
    multiple: m.multiple > 1e12 ? formatCount(m.multiple) : formatCount(Math.round(m.multiple)),
    newcomers: formatCount(m.newcomers),
  };
}

function flagText(f) {
  const t = c().flags[f.id];
  return t ? { label: t[0], why: t[1] } : { label: f.label, why: f.why };
}

function renderStatic() {
  document.documentElement.lang = lang === 'pcm' ? 'pcm' : 'en';
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = c()[el.dataset.t]; });
  document.querySelectorAll('[data-ph]').forEach((el) => { el.placeholder = c()[el.dataset.ph]; });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function highlighted(src, flags) {
  const spans = flags.map((f, i) => ({ ...f, n: i + 1 })).sort((a, b) => a.start - b.start);
  let out = '';
  let pos = 0;
  for (const s of spans) {
    if (s.start < pos) continue; // skip overlaps; the earlier highlight already covers it
    out += escapeHtml(src.slice(pos, s.start));
    out += `<mark id="hl-${s.n}" class="${s.id === 'high_return' ? 'hot' : ''}"><sup>${s.n}</sup>${escapeHtml(src.slice(s.start, s.end))}</mark>`;
    pos = s.end;
  }
  return out + escapeHtml(src.slice(pos));
}

function renderResult() {
  if (!result) return;
  const r = result;
  const [title, sub] = c().verdict[r.verdict];
  const v = $('#verdict');
  v.className = `verdict ${r.verdict}`;
  v.querySelector('h2').textContent = title;
  v.querySelector('p').textContent = sub;

  const math = $('#math');
  math.classList.toggle('muted', !r.math);
  math.querySelector('p').textContent = r.math ? c().math(mathView(r.math)) : c().mathNone;

  $('#flagsTitle').textContent = c().flagsTitle(r.flags.length);
  $('#flags').innerHTML = r.flags.map((f, i) => {
    const t = flagText(f);
    return `<li><a href="#hl-${i + 1}"><span class="num">${i + 1}</span><span class="body"><strong>${escapeHtml(t.label)}</strong>${f.source === 'ai' ? ` <em class="ai">${c().aiTag}</em>` : ''}<q>${escapeHtml(f.quote)}</q><span class="why">${escapeHtml(t.why)}</span></span></a></li>`;
  }).join('');
  $('#flags').parentElement.hidden = r.flags.length === 0;

  $('#message').innerHTML = highlighted(checkedText, r.flags);
  $('#before').innerHTML = c().before.map((b) => `<li>${escapeHtml(b)}</li>`).join('');
  $('#copied').textContent = '';
  $('#result').hidden = false;
}

function setLang(l) {
  lang = l;
  localStorage.setItem('shineeye-lang', l);
  renderStatic();
  renderResult();
  $('#note').textContent = '';
}

// With the Node server running, /api/check adds the optional AI second look.
// On the static site (or if the server is unreachable) the same rules run right here in the browser,
// so the message never leaves the phone.
async function checkText(value) {
  if (location.hostname.endsWith('github.io')) return check(value);
  try {
    const res = await fetch('api/check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: value }) });
    const type = res.headers.get('content-type') || '';
    if (res.ok && type.includes('application/json')) return await res.json();
  } catch {}
  return check(value);
}

async function runCheck() {
  const value = text.value.trim();
  if (value.length < 40) { $('#note').textContent = c().tooShort; return; }
  go.disabled = true;
  go.textContent = c().checking;
  $('#note').textContent = '';
  try {
    result = await checkText(value);
    checkedText = value;
    renderResult();
    $('#verdict').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    $('#note').textContent = c().failed;
  } finally {
    go.disabled = text.value.trim().length === 0;
    go.textContent = c().check;
  }
}

export function shareText(r, l = lang) {
  const view = { ...r, mathFinal: r.math ? formatNaira(r.math.final) : '' };
  return COPY[l].share(view, COPY[l]);
}

document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
document.querySelectorAll('[data-example]').forEach((b) => b.addEventListener('click', () => {
  text.value = EXAMPLES[b.dataset.example];
  go.disabled = false;
  runCheck();
}));
text.addEventListener('input', () => { go.disabled = text.value.trim().length === 0; });
go.addEventListener('click', runCheck);
$('#copy').addEventListener('click', async () => {
  const msg = shareText(result);
  try { await navigator.clipboard.writeText(msg); } catch {
    const ta = document.createElement('textarea'); ta.value = msg; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  $('#copied').textContent = c().copied;
});

renderStatic();
