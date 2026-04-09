const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transparent Zen Demo</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      color: white; display: grid; place-items: center; padding: 32px;
    }
    .panel {
      width: min(720px, 100%); padding: 32px; border-radius: 24px;
      background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
      backdrop-filter: blur(28px) saturate(180%); box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    }
    h1 { margin: 0 0 10px; font-size: clamp(2rem,5vw,3.75rem); line-height: 0.95; letter-spacing: -0.05em; }
    p { margin: 0 0 22px; line-height: 1.6; color: rgba(255,255,255,0.78); max-width: 52ch; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    button {
      appearance: none; border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.12); color: white; padding: 11px 16px;
      border-radius: 999px; font: inherit; cursor: pointer;
      backdrop-filter: blur(16px) saturate(160%);
    }
  </style>
</head>
<body>
  <section class="panel">
    <h1>Transparent page.</h1>
    <p>The page background is fully transparent, so Zen can let the desktop bleed through.</p>
    <div class="row"><button>Primary</button><button>Secondary</button></div>
  </section>
</body>
</html>`;

const ed = document.getElementById('ed');
const pv = document.getElementById('pv');
const ln = document.getElementById('ln');
const dot = document.getElementById('dot');
const stxt = document.getElementById('stxt');
const findInput = document.getElementById('findInput');
const findCount = document.getElementById('findCount');
let timer = null, curFile = 'untitled.html', isDark = true;
let matches = [], matchIndex = -1;

ed.value = DEFAULT_CODE;

function openInTab() {
  const b = new Blob([ed.value], {type:'text/html'});
  window.open(URL.createObjectURL(b), '_blank');
}

function findMatches() {
  const query = findInput.value.toLowerCase();
  const text = ed.value.toLowerCase();
  matches = []; matchIndex = -1;
  if (!query) { findCount.textContent = '0 results'; return; }
  let pos = 0;
  while ((pos = text.indexOf(query, pos)) !== -1) { matches.push(pos); pos += query.length || 1; }
  findCount.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'}`;
}

function jumpToMatch(index) {
  if (!matches.length) return;
  matchIndex = (index + matches.length) % matches.length;
  const start = matches[matchIndex];
  ed.focus(); ed.selectionStart = start; ed.selectionEnd = start + findInput.value.length;
  updateCursor();
}

function findNext() { findMatches(); if (matches.length) jumpToMatch(matchIndex + 1); }
function findPrev() { findMatches(); if (matches.length) jumpToMatch(matchIndex - 1); }

function updateLn() {
  const lines = ed.value.split('\n');
  ln.textContent = lines.map((_,i) => i+1).join('\n');
  document.getElementById('sbl').textContent = lines.length + ' lines';
  document.getElementById('sbch').textContent = ed.value.length + ' chars';
}

function updateCursor() {
  const pre = ed.value.substring(0, ed.selectionStart).split('\n');
  document.getElementById('sbc').textContent = 'Ln ' + pre.length + ', Col ' + (pre[pre.length-1].length+1);
}

function setStatus(msg, type) {
  stxt.textContent = msg;
  dot.style.background = type==='ok' ? 'var(--ok)' : type==='err' ? 'var(--err)' : 'var(--faint)';
}

function runPreview() {
  try {
    const b = new Blob([ed.value], {type:'text/html'});
    const u = URL.createObjectURL(b);
    const old = pv.src;
    pv.src = u;
    if (old && old.startsWith('blob:')) URL.revokeObjectURL(old);
    setStatus('Updated','ok'); setTimeout(()=>setStatus('Ready','idle'),1500);
  } catch(e) { setStatus('Error','err'); }
}

function saveFile() {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([ed.value],{type:'text/html'})),
    download: curFile
  });
  a.click(); URL.revokeObjectURL(a.href);
  setStatus('Saved','ok'); setTimeout(()=>setStatus('Ready','idle'),2000);
}

function openFile(e) {
  const f = e.target.files[0]; if (!f) return;
  curFile = f.name; document.getElementById('fn').textContent = f.name;
  const r = new FileReader();
  r.onload = ev => { ed.value = ev.target.result; updateLn(); runPreview(); };
  r.readAsText(f);
}

function clearEditor() {
  if (!confirm('Clear?')) return;
  ed.value = ''; updateLn(); pv.src = 'about:blank'; setStatus('Cleared','idle');
}

function toggleEditor() {
  const ep = document.getElementById('ep'), dv = document.getElementById('dv');
  const h = ep.style.display === 'none';
  ep.style.display = h ? 'flex' : 'none';
  dv.style.display = h ? '' : 'none';
}

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeBtn').innerHTML = isDark
    ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
}

// Wire up buttons
document.getElementById('fi').addEventListener('change', openFile);
document.querySelector('[data-action="open"]').addEventListener('click', () => document.getElementById('fi').click());
document.querySelector('[data-action="save"]').addEventListener('click', saveFile);
document.querySelector('[data-action="run"]').addEventListener('click', runPreview);
document.querySelector('[data-action="popout"]').addEventListener('click', openInTab);
document.querySelector('[data-action="clear"]').addEventListener('click', clearEditor);
document.querySelector('[data-action="toggle-editor"]').addEventListener('click', toggleEditor);
document.getElementById('themeBtn').addEventListener('click', toggleTheme);
document.querySelector('[data-action="find-prev"]').addEventListener('click', findPrev);
document.querySelector('[data-action="find-next"]').addEventListener('click', findNext);
findInput.addEventListener('input', findMatches);

ed.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); const s=ed.selectionStart; ed.value=ed.value.substring(0,s)+'  '+ed.value.substring(ed.selectionEnd); ed.selectionStart=ed.selectionEnd=s+2; updateLn(); }
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); runPreview(); }
  if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); saveFile(); }
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='f') { e.preventDefault(); findInput.focus(); findInput.select(); }
  if (e.key === 'Enter' && document.activeElement === findInput) { e.preventDefault(); if (e.shiftKey) findPrev(); else findNext(); }
});

ed.addEventListener('input', () => { updateLn(); clearTimeout(timer); setStatus('Editing…','idle'); timer=setTimeout(runPreview,800); });
ed.addEventListener('keyup', updateCursor);
ed.addEventListener('click', updateCursor);
ed.addEventListener('scroll', () => { ln.scrollTop = ed.scrollTop; });

const dv = document.getElementById('dv');
let drag=false, sx=0, sw=0;
dv.addEventListener('mousedown', e => { drag=true; sx=e.clientX; sw=document.getElementById('ep').offsetWidth; document.body.style.cssText='cursor:col-resize;user-select:none'; });
document.addEventListener('mousemove', e => { if(!drag)return; const ep=document.getElementById('ep'); const w=Math.max(180,Math.min(document.getElementById('ws').offsetWidth-180,sw+e.clientX-sx)); ep.style.flex='none'; ep.style.width=w+'px'; });
document.addEventListener('mouseup', () => { drag=false; document.body.style.cssText=''; });

updateLn();
runPreview();
setStatus('Ready','idle');
