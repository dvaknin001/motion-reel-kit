/* Dean Builds AI — the hero is rendered live by the Motion Reel Kit; the calls to action adapt to where the
   visitor came from (Instagram → YouTube, YouTube → Instagram). Content and links come from window.SITE,
   which tools/build-site.mjs fills from site/site.config.json. */
(function () {
  'use strict';
  const S = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I = S.icons || {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  window.__siteReady = true;

  /* ---------- where did they come from? ?from=ig | yt (put it on your bio links), else referrer / in-app browser ---------- */
  const q = new URLSearchParams(location.search);
  const tag = (q.get('from') || q.get('src') || q.get('utm_source') || '').toLowerCase();
  const ref = (document.referrer || '').toLowerCase(), ua = navigator.userAgent || '';
  let origin = 'direct';
  if (/^(ig|insta|instagram)$/.test(tag) || /instagram\.com/.test(ref) || /\bInstagram\b/.test(ua)) origin = 'instagram';
  else if (/^(yt|youtube)$/.test(tag) || /youtube\.com|youtu\.be/.test(ref)) origin = 'youtube';
  try { if (origin !== 'direct') sessionStorage.setItem('origin', origin); else origin = sessionStorage.getItem('origin') || 'direct'; } catch (e) { /* storage blocked */ }
  document.documentElement.dataset.origin = origin;

  /* ---------- calls to action ---------- */
  const IG = S.instagram && S.instagram.url, YT = S.youtube && S.youtube.url;
  const ext = 'target="_blank" rel="noopener"';
  const cta = {
    ig: (cls = 'btn-primary') => IG && `<a class="btn ${cls}" href="${esc(IG)}" ${ext} data-cta="instagram">${I.ig}<span class="txt">Follow on Instagram<small>@${esc(S.instagram.handle)}</small></span></a>`,
    yt: (cls = 'btn-red') => YT && `<a class="btn ${cls}" href="${esc(YT + (YT.includes('?') ? '&' : '?') + 'sub_confirmation=1')}" ${ext} data-cta="youtube">${I.yt}<span class="txt">Subscribe on YouTube<small>${esc(S.youtube.handle ? '@' + S.youtube.handle : 'Free')}</small></span></a>`,
    kit: (cls = 'btn-ghost') => `<a class="btn ${cls}" href="#kit" data-cta="kit">${I.code}<span class="txt">Get the free motion kit<small>Open source · MIT</small></span></a>`,
  };
  // the other platform goes first: an Instagram visitor already follows you there
  const order = origin === 'instagram' ? (YT ? [cta.yt('btn-red'), cta.kit()] : [cta.kit('btn-primary'), cta.ig('btn-ghost')])
    : origin === 'youtube' ? [cta.ig('btn-primary'), cta.kit()]
      : [cta.ig('btn-primary'), YT && cta.yt('btn-red'), cta.kit()];
  const heroCtas = $('#hero-ctas');
  if (heroCtas) heroCtas.innerHTML = order.filter(Boolean).join('');
  // follow cards: the platform they didn't come from goes first
  const grid = $('#follow-grid');
  if (grid && origin === 'instagram') { const yt = grid.querySelector('[data-platform="youtube"]'); if (yt) grid.prepend(yt); }

  // welcome line for visitors from the other platform
  const W = S.welcome || {};
  const welcome = $('#welcome');
  const msg = origin === 'instagram' ? (YT ? W.instagram : W.instagramNoYoutube) : origin === 'youtube' ? W.youtube : null;
  if (welcome && msg) {
    const target = origin === 'instagram' ? (YT ? { href: YT + '?sub_confirmation=1', text: 'Subscribe on YouTube', ext: true } : { href: '#kit', text: 'Get the free kit' })
      : { href: IG, text: 'Follow on Instagram', ext: true };
    welcome.innerHTML = `<span>${esc(msg)}</span><a href="${esc(target.href)}" ${target.ext ? ext : ''}>${esc(target.text)} &rarr;</a>`;
    welcome.hidden = false;
  }

  // phone dock: the first call to action, once the hero buttons scroll away (hidden again at the follow card)
  const dock = $('#dock');
  if (dock && order[0]) {
    dock.innerHTML = order.filter(Boolean).slice(0, 2).map((h, i) => (i ? h.replace(/<span class="txt">([^<]*)<small>[^<]*<\/small><\/span>/, '<span class="txt">$1</span>') : h)).join('');
    dock.hidden = false;
    let pastHero = false, atFollow = false;
    const upd = () => dock.classList.toggle('show', pastHero && !atFollow);
    if (heroCtas) new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(heroCtas);
    const follow = $('#follow');
    if (follow) new IntersectionObserver(([e]) => { atFollow = e.isIntersecting; upd(); }, { threshold: 0.2 }).observe(follow);
  }

  /* ---------- scroll reveals (staggered within a group) ---------- */
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => { c.classList.add('reveal'); c.style.setProperty('--d', `${Math.min(i, 8) * 60}ms`); }));
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1600); } catch (e) { b.textContent = 'Select & copy'; }
  }));

  /* ---------- the hero: a Motion Reel Kit style, playing live ---------- */
  async function hero() {
    const screen = $('#hero-screen'), stage = $('#hero-stage'), btn = $('#hero-sound');
    if (!screen || !stage || !window.Reel || !window.gsap || !S.hero) return;   // the poster image stays
    await Reel.ready({ families: S.hero.fonts || [] });
    const player = new Reel.Player(stage, [{ def: S.hero.style, params: S.hero.params }], { loop: true });
    const fit = () => { stage.style.transform = `scale(${screen.clientWidth / 1920})`; };
    new ResizeObserver(fit).observe(screen); fit();
    player.seek(reduce ? S.hero.poster : 0);
    stage.classList.add('on');
    const audio = window.SFX ? new SFX.Live() : null;
    if (audio) player.audio = audio;
    let visible = true, started = !reduce;
    const sync = () => { if (started && visible && !document.hidden) player.play(); else player.pause(); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.1 }).observe(screen);
    document.addEventListener('visibilitychange', sync);
    sync();
    if (btn && audio) btn.addEventListener('click', async () => {
      if (audio.on) audio.disable();
      else {
        try { await audio.enable(); } catch (e) { return; }
        if (!started) { started = true; player.seek(0); }
        sync();
        if (player.playing) audio.resumeAt(player);
      }
      btn.setAttribute('aria-pressed', String(audio.on));
      btn.innerHTML = `${audio.on ? I.soundOn : I.soundOff}<span>${audio.on ? 'Sound on' : 'Sound off'}</span>`;
    });
    window.__hero = player;
  }
  // the kit's scripts load after this file; start the hero once everything is in
  if (document.readyState === 'complete') hero().catch((e) => console.warn('[site] hero', e));
  else addEventListener('load', () => hero().catch((e) => console.warn('[site] hero', e)));

  const y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
})();
