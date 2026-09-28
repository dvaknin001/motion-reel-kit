/* Portfolio page: reel player, NLE timeline, live notes, piece cards, measured rules. */
(async function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const REEL = window.REEL, SEQ = REEL.sequence, PAGE = REEL.page || {};
  const FPS = REEL.fps || 60;
  const pad = (n) => String(n).padStart(2, '0');
  const tc = (t) => { const f = Math.round(t * FPS), s = Math.floor(f / FPS); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % FPS)}`; };
  const mmss = (t) => { const s = Math.round(t); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const BAR_COLORS = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  document.querySelectorAll('.bars').forEach((b) => { b.innerHTML = BAR_COLORS.map((c) => `<i style="background:${c}"></i>`).join(''); });

  await Reel.ready();

  /* ---------------- player ---------------- */
  const stage = $('#stage'), host = $('#stage-host');
  const toItem = (it) => ({ def: it.style, params: it.params, meta: it.meta, trans: it.trans, mix: it.mix, key: it.key });
  const player = new Reel.Player(stage, SEQ.map(toItem));
  const audio = new SFX.Live();
  player.audio = audio;
  const D = player.duration;
  const items = player.items;
  const M = (e) => e.kit.meta;                         // niche/title/why/techniques/facts after params + reel overrides
  const isBookend = (e) => !!SEQ[e.index].role;        // role: 'open' | 'close' (not a piece)
  const pieces = items.filter((e) => !isBookend(e));
  const fit = (h, s) => { const w = h.clientWidth, hh = h.clientHeight; if (!w || !hh) return; const k = Math.min(w / 1920, hh / 1080); s.style.transform = `translate(${((w - 1920 * k) / 2).toFixed(2)}px,${((hh - 1080 * k) / 2).toFixed(2)}px) scale(${k})`; };
  new ResizeObserver(() => fit(host, stage)).observe(host);
  fit(host, stage);

  const colorOf = (e) => (isBookend(e) ? '#8C8F99' : (e.kit.palette && e.kit.palette[0]) || '#888');
  $('#tc-dur').textContent = tc(D);
  $('#bigplay-meta').textContent = `${mmss(D)} · ${pieces.length} pieces · sound on`;
  player.seek(items[0].start + (items[0].kit.poster ?? 0));

  let userMuted = false, loopOn = false, loopEntry = null;
  items.forEach((e) => { const tin = player.trans.find((x) => x.b === e), tout = player.trans.find((x) => x.a === e); e.cs = tin ? tin.end : e.start; e.ce = tout ? tout.start : e.end; });
  const cleanAt = (t) => items.find((e) => t >= e.cs - 1e-3 && t < e.ce) || player.sceneAt(t);
  const btnPlay = $('#btn-play'), glyph = $('#play-glyph'), bigplay = $('#bigplay'), btnSound = $('#btn-sound'), btnLoop = $('#btn-loop');
  const PLAY_D = 'M3 1.8v12.4c0 .6.7 1 1.2.7l10-6.2c.5-.3.5-1 0-1.3l-10-6.3C3.7.8 3 1.2 3 1.8z';
  const PAUSE_D = 'M3 1h3.5v14H3zM9.5 1H13v14H9.5z';
  const setSoundUI = () => { btnSound.setAttribute('aria-pressed', String(audio.on)); btnSound.textContent = audio.on ? 'Sound on' : 'Sound off'; };
  const setPlayUI = () => { glyph.setAttribute('d', player.playing ? PAUSE_D : PLAY_D); btnPlay.setAttribute('aria-label', player.playing ? 'Pause' : 'Play'); };
  async function soundOnIfWanted() { if (!userMuted && !audio.on) { try { await audio.enable(); } catch (e) { /* audio refused */ } } setSoundUI(); }
  async function start(at) {
    bigplay.hidden = true;
    await soundOnIfWanted();
    if (at != null) seek(at);
    else if (player.t >= D - 0.05) seek(0);
    player.play();
  }
  function seek(t) {
    player.seek(t);
    if (loopOn) loopEntry = cleanAt(player.t);
    if (audio.on) { audio.halt(); if (player.playing) audio.resumeAt(player); }
    update(player.t);
  }
  bigplay.addEventListener('click', () => start(0));
  btnPlay.addEventListener('click', () => { if (player.playing) player.pause(); else start(); });
  btnSound.addEventListener('click', async () => {
    if (audio.on) { audio.disable(); userMuted = true; }
    else { userMuted = false; try { await audio.enable(); if (player.playing) audio.resumeAt(player); } catch (e) { /* refused */ } }
    setSoundUI();
  });
  document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    player.setRate(parseFloat(b.dataset.rate));
  }));
  btnLoop.addEventListener('click', () => { loopOn = !loopOn; loopEntry = loopOn ? cleanAt(player.t) : null; btnLoop.setAttribute('aria-pressed', String(loopOn)); });
  $('#btn-fs').addEventListener('click', () => {
    const el = $('#player');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  });
  player.on('play', setPlayUI).on('pause', setPlayUI).on('ended', setPlayUI);

  /* ---------------- NLE timeline ---------------- */
  const inner = $('#nle-inner'), laneV = $('#lane-v'), laneB = $('#lane-b'), ruler = $('#ruler'), head = $('#playhead'), cv = $('#sfx-canvas');
  const pct = (t) => `${((t / D) * 100).toFixed(4)}%`;
  items.forEach((e) => {
    const c = document.createElement('div');
    c.className = 'clip'; c.style.left = pct(e.start); c.style.width = pct(e.end - e.start); c.style.setProperty('--c', colorOf(e));
    c.innerHTML = `<span class="cn">${esc(M(e).niche)}</span><span class="ct">${esc(M(e).title)}</span>`;
    c.title = `${M(e).niche} · ${M(e).title} · ${tc(e.start)}`;
    laneV.appendChild(c); e._clip = c;
  });
  player.trans.forEach((tr) => { const x = document.createElement('div'); x.className = 'xfade'; x.style.left = pct(tr.start); x.style.width = pct(Math.max(tr.end - tr.start, D * 0.002)); x.title = `${tr.type} transition`; laneV.appendChild(x); });
  const beats = player.beats.slice().sort((a, b) => a.t - b.t);
  beats.forEach((b, i) => {
    const d = document.createElement('button');
    const e = items[b.scene];
    d.type = 'button'; d.className = 'beat'; d.style.left = pct(b.t);
    d.setAttribute('aria-label', `${tc(b.t)} ${M(e).title}: ${b.label}`); d.title = `${tc(b.t)} · ${M(e).title} — ${b.label}`;
    d.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    d.addEventListener('click', (ev) => { ev.stopPropagation(); seek(b.t); });
    laneB.appendChild(d); b._el = d; b.i = i;
  });
  function drawRuler() {
    const w = inner.clientWidth; ruler.innerHTML = '';
    const step = w < 520 ? 30 : w < 900 ? 20 : 10;
    for (let s = 0; s <= D + 1e-6; s += 5) {
      const tick = document.createElement('i'); tick.style.left = pct(s); if (s % step === 0) tick.className = 'major'; ruler.appendChild(tick);
      if (s % step === 0 && s < D - 2) { const l = document.createElement('span'); l.textContent = mmss(s); l.style.left = pct(s); ruler.appendChild(l); }
    }
  }
  const CAT = {
    hit: new Set(['impact', 'boom', 'braam', 'stamp', 'thud', 'drum', 'bass', 'heartbeat', 'thunder', 'buzzer', 'crt']),
    air: new Set(['whoosh', 'swoosh', 'riser', 'wind', 'scratch', 'paper']),
    bed: new Set(['drone', 'pad']),
  };
  const catOf = (n) => (CAT.hit.has(n) ? 'hit' : CAT.air.has(n) ? 'air' : CAT.bed.has(n) ? 'bed' : 'ui');
  const COL = { hit: '#ef6a4b', air: '#4fc4d6', ui: '#f2b33d', bed: '#7d6bd6' };
  const DEF_GAIN = { hit: 0.6, air: 0.45, ui: 0.3, bed: 0.12 };
  function drawCues() {
    const r = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    const x = cv.getContext('2d'); x.scale(r, r); x.clearRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, h / 2 - 0.5, w, 1);
    for (const c of player.cues) if (catOf(c.name) === 'bed') {
      const x0 = (c.t / D) * w, x1 = (Math.min(D, c.t + ((c.o && c.o.dur) || 2)) / D) * w;
      x.fillStyle = 'rgba(125,107,214,.22)'; x.fillRect(x0, h / 2 - 7, Math.max(1, x1 - x0), 14);
    }
    for (const c of player.cues) {
      const k = catOf(c.name); if (k === 'bed') continue;
      const g = Math.min(1, (c.o && c.o.gain != null ? c.o.gain : DEF_GAIN[k]) / 0.7);
      const hh = 3 + g * (h / 2 - 3), px = Math.round((c.t / D) * w) + 0.5;
      x.strokeStyle = COL[k]; x.globalAlpha = 0.85; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, h / 2 - hh); x.lineTo(px, h / 2 + hh); x.stroke();
    }
    x.globalAlpha = 1;
  }
  const counts = { hit: 0, air: 0, ui: 0, bed: 0 };
  player.cues.forEach((c) => counts[catOf(c.name)]++);
  $('#legend').innerHTML = [
    `<span>V1 picture · ${pieces.length} pieces · ${player.trans.length} transitions</span>`,
    `<span><b style="background:${COL.hit}"></b>hits ${counts.hit}</span>`,
    `<span><b style="background:${COL.air}"></b>air ${counts.air}</span>`,
    `<span><b style="background:${COL.ui}"></b>UI and foley ${counts.ui}</span>`,
    `<span><b style="background:${COL.bed}"></b>beds ${counts.bed}</span>`,
    `<span>◆ ${beats.length} editing notes</span>`,
  ].join('');
  new ResizeObserver(() => { drawRuler(); drawCues(); }).observe(inner);

  // scrubbing
  const nle = $('#nle');
  let dragging = false, wasPlaying = false;
  const tAt = (ev) => { const r = inner.getBoundingClientRect(); return Math.max(0, Math.min(D, ((ev.clientX - r.left) / r.width) * D)); };
  nle.addEventListener('pointerdown', (ev) => { dragging = true; wasPlaying = player.playing; if (wasPlaying) player.pause(); nle.setPointerCapture(ev.pointerId); bigplay.hidden = true; seek(tAt(ev)); });
  nle.addEventListener('pointermove', (ev) => { if (dragging) seek(tAt(ev)); });
  const endDrag = () => { if (!dragging) return; dragging = false; if (wasPlaying) start(); };
  nle.addEventListener('pointerup', endDrag); nle.addEventListener('pointercancel', endDrag);
  nle.addEventListener('keydown', (ev) => {
    const k = ev.key; let t = null;
    if (k === 'ArrowRight') t = player.t + (ev.shiftKey ? 5 : 1);
    else if (k === 'ArrowLeft') t = player.t - (ev.shiftKey ? 5 : 1);
    else if (k === 'Home') t = 0; else if (k === 'End') t = D;
    if (t != null) { ev.preventDefault(); bigplay.hidden = true; seek(t); }
  });
  $('#reel').addEventListener('keydown', (ev) => {
    if (ev.target.closest('button') && ev.key === ' ') return;
    if (ev.key === ' ' || ev.key === 'k') { ev.preventDefault(); if (player.playing) player.pause(); else start(); }
  });

  /* ---------------- per-frame UI ---------------- */
  const tcNow = $('#tc-now'), nowN = $('#now-niche'), nowT = $('#now-title'), cTc = $('#c-tc'), cText = $('#c-text');
  let curEntry = null, curBeat = -1;
  function update(t) {
    tcNow.textContent = tc(t);
    head.style.left = pct(t);
    const e = player.sceneAt(t);
    if (e !== curEntry) {
      if (curEntry) curEntry._clip.classList.remove('on');
      e._clip.classList.add('on'); curEntry = e;
      nowN.textContent = M(e).niche; nowT.textContent = M(e).title;
    }
    let bi = -1; for (let i = 0; i < beats.length; i++) { if (beats[i].t <= t + 1e-3) bi = i; else break; }
    if (bi !== curBeat) {
      if (curBeat >= 0) beats[curBeat]._el.classList.remove('on');
      curBeat = bi;
      if (bi >= 0) {
        const b = beats[bi]; b._el.classList.add('on');
        cTc.textContent = tc(b.t);
        cText.innerHTML = `<b>${esc(M(items[b.scene]).title)}.</b> ${esc(b.label)}`;
      }
    }
    if (loopOn && loopEntry && player.playing && t >= loopEntry.ce - 0.01) seek(loopEntry.cs);
  }
  player.on('time', update);
  update(player.t);

  /* ---------------- piece cards ---------------- */
  const grid = $('#grid');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { buildMini(en.target); io.unobserve(en.target); } }), { rootMargin: '400px 0px' }) : null;
  function jumpTo(e) {
    const at = e.cs;
    $('#reel').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    start(at);
  }
  pieces.forEach((e) => {
    const d = e.def, m = M(e), card = document.createElement('article');
    const posterT = e.kit.poster ?? e.kit.dur - 0.5;
    card.className = e === pieces[0] ? 'card feature' : 'card'; card.style.setProperty('--c', colorOf(e));
    const nCues = player.cues.filter((c) => c.scene === e.index).length;
    card.innerHTML = `
      <div class="thumb" style="background:${esc(e.kit.P.bg || d.bg || '#000')}"><div class="mini"></div>
        <button class="go" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${PLAY_D}"/></svg>Play in reel · ${tc(e.start).slice(3, 8)}</button></div>
      <div class="txt">
      <div class="meta"><span class="niche"><b></b>${esc(m.niche)}</span><span class="dur">${e.kit.dur.toFixed(1)} s · ${nCues} sounds</span></div>
      <h3>${esc(m.title)}</h3>
      <p class="why">${esc(m.why || '')}</p>
      <ul class="tags">${(m.techniques || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${m.facts ? `<p class="facts"><b>Facts</b>${esc(m.facts)}</p>` : ''}
      </div>`;
    card._entry = e;
    grid.appendChild(card);
    const thumb = card.querySelector('.thumb');
    card.querySelector('.go').addEventListener('click', (ev) => { ev.stopPropagation(); jumpTo(e); });
    thumb.addEventListener('click', () => jumpTo(e));
    thumb.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'mouse' || reduce || !card._p) return; card._p.seek(0); card._p.play(); });
    thumb.addEventListener('pointerleave', () => { if (!card._p) return; card._p.pause(); card._p.seek(posterT); });
    if (io) io.observe(card); else buildMini(card);
  });
  // Build every preview in idle time so thumbnails are ready without scrolling; the observer only reorders.
  const idle = window.requestIdleCallback ? (f) => requestIdleCallback(f, { timeout: 500 }) : (f) => setTimeout(f, 80);
  const queue = [...grid.children];
  const pump = () => { const c = queue.shift(); if (!c) return; buildMini(c); idle(pump); };
  setTimeout(() => idle(pump), 250);
  function buildMini(card) {
    if (card._p) return;
    const e = card._entry, d = e.def, it = SEQ[e.index], mini = card.querySelector('.mini'), thumb = card.querySelector('.thumb');
    try {
      const p = new Reel.Player(mini, [{ def: it.style, params: it.params, meta: it.meta, key: it.key }], { loop: true });
      p.seek(e.kit.poster ?? e.kit.dur - 0.5);
      card._p = p;
      const f = () => fit(thumb, mini);
      new ResizeObserver(f).observe(thumb); f();
    } catch (err) { console.warn('[page] preview failed', d.id, err); }
  }

  /* ---------------- measured rules ---------------- */
  const events = player.cues.filter((c) => catOf(c.name) !== 'bed').map((c) => c.t).sort((a, b) => a - b);
  const span0 = items[0].end, span1 = items[items.length - 1].start;
  let maxGap = 0, gapAt = 0;
  for (let i = 1; i < events.length; i++) { if (events[i - 1] < span0 || events[i] > span1) continue; const g = events[i] - events[i - 1]; if (g > maxGap) { maxGap = g; gapAt = events[i - 1]; } }
  const byKey = (k) => items.find((e) => e.key === k);
  const jump = (l) => {
    const e = byKey(l.key); if (!e) return '';
    const at = e.start + (l.at || 0);
    return `<button class="jump" type="button" data-at="${at.toFixed(3)}"${l.rate ? ` data-rate="${l.rate}"` : ''}><span class="t">${l.rate ? (l.rate === 0.25 ? '¼×' : l.rate === 0.5 ? '½×' : l.rate + '×') : tc(at).slice(3, 8)}</span>${esc(l.label || M(e).title)}</button>`;
  };
  // measured numbers a rule can quote: {pieces} {maxGap} {cues} {cueEvery} {duration} {transitions}
  const STATS = {
    pieces: String(pieces.length), transitions: String(player.trans.length), duration: mmss(D),
    maxGap: `<span class="stat">${maxGap.toFixed(1)} s</span>`, cues: `<span class="stat">${player.cues.length}</span>`,
    cueEvery: `<span class="stat">${(D / player.cues.length).toFixed(2)} s</span>`,
  };
  const RULES = (PAGE.rules || []).map((r) => [r.title, esc(r.text).replace(/\{(\w+)\}/g, (m, k) => STATS[k] ?? m), (r.links || []).map(jump).join('')]);
  const rulesList = $('#rules-list');
  if (rulesList) rulesList.innerHTML = RULES.map(([h, p, links]) => `<div class="rule"><h3>${esc(h)}</h3><p>${p}</p>${links ? `<div class="links">${links}</div>` : ''}</div>`).join('');
  if (rulesList) rulesList.addEventListener('click', (ev) => {
    const b = ev.target.closest('.jump'); if (!b) return;
    if (b.dataset.rate) { const r = b.dataset.rate; document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.rate === r))); player.setRate(parseFloat(r)); }
    $('#reel').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    start(parseFloat(b.dataset.at));
  });
  window.__page = { player, audio };
})();
