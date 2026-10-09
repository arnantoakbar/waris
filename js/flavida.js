/*!
 * Flavida · site behaviours (classic script, global `Flavida`)
 * Needs: js/motion.min.js (window.Motion). Optional: js/flav.js (mascot), assets/v4/icons.sprite.js (icons).
 * Include at the END of <body> (before first paint of below-the-fold content):
 *   <script src="…/js/motion.min.js"></script>
 *   <script src="…/assets/v4/icons.sprite.js"></script>
 *   <script src="…/js/flav.js"></script>
 *   <script src="…/js/flavida.js"></script>
 * Everything here is progressive enhancement: with JS off or Motion missing the page is fully visible/usable.
 *
 * Declarative hooks (all optional)
 *   data-reveal="up|fade|pop|left|right|rise"   one-shot reveal when scrolled into view
 *   data-reveal-delay="120"                     ms
 *   .fl-marker[data-draw]                      marker highlight that paints in on view (data-draw="300" = delay ms)
 *   data-stagger                                on a parent: reveal its direct children in sequence
 *   data-split                                  headline words rise in (text stays selectable, aria-label kept)
 *   data-tilt="8"                               pointer tilt in degrees (fine pointers only)
 *   data-magnet="0.25"                          button leans toward the pointer
 *   data-parallax="0.12"                        scroll parallax factor (+ moves slower, - faster)
 *   data-count="1200"                           count up to this number when visible (data-count-suffix="+")
 *   data-pose-on-view="joy"  (on a section)     <flav-mascot data-guide> switches pose while that section is in view
 *   .fl-marquee > .fl-marquee__track            content is cloned once for a seamless loop
 *   .fl-nav[data-autohide]                      hides on scroll down, returns on scroll up
 *   .fl-nav__toggle + #menu.fl-menu             mobile menu
 *   .fl-tabs [role=tab] aria-controls=panelId   tabs with keyboard support
 * Imperative:  Flavida.toast(msg, {pose}) · Flavida.reveal(el) · Flavida.reduced · Flavida.on('motion', fn)
 */
(function (root) {
  'use strict';
  var M = root.Motion || null;
  var doc = root.document;
  if (!doc) return;

  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: function () {} };
  var finePointer = root.matchMedia ? root.matchMedia('(hover: hover) and (pointer: fine)').matches : false;
  var api = { reduced: !!mq.matches, version: '4.0.0', M: M };
  var listeners = [];
  var EASE = [0.16, 1, 0.3, 1];

  function onMotionChange() {
    api.reduced = !!mq.matches;
    for (var i = 0; i < listeners.length; i++) listeners[i](api.reduced);
  }
  if (mq.addEventListener) mq.addEventListener('change', onMotionChange);
  api.on = function (evt, fn) { if (evt === 'motion') listeners.push(fn); };

  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }

  /* ───────── icon sprite ───────── */
  function injectIcons() {
    if (!root.FLAVIDA_ICONS || doc.getElementById('fl-icon-sprite')) return;
    var holder = doc.createElement('div');
    holder.id = 'fl-icon-sprite';
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    holder.innerHTML = root.FLAVIDA_ICONS;
    doc.body.insertBefore(holder, doc.body.firstChild);
  }

  /* ───────── reveal on scroll ───────── */
  var REVEAL_FROM = {
    up:    { opacity: 0, y: 28 },
    rise:  { opacity: 0, y: 56 },
    fade:  { opacity: 0 },
    pop:   { opacity: 0, scale: 0.86 },
    left:  { opacity: 0, x: -36 },
    right: { opacity: 0, x: 36 }
  };
  var hidden = [];

  function setFrom(el, kind) {
    var f = REVEAL_FROM[kind] || REVEAL_FROM.up;
    el.style.opacity = '0';
    el.__flFrom = f;
    hidden.push(el);
  }
  function playReveal(el, delayMs) {
    var f = el.__flFrom || REVEAL_FROM.up;
    var to = { opacity: 1 };
    var from = { opacity: 0 };
    if (f.y !== undefined) { from.y = f.y; to.y = 0; }
    if (f.x !== undefined) { from.x = f.x; to.x = 0; }
    if (f.scale !== undefined) { from.scale = f.scale; to.scale = 1; }
    var kf = {};
    for (var k in to) kf[k] = [from[k], to[k]];
    var pop = f.scale !== undefined;
    var a = M.animate(el, kf, pop
      ? { type: 'spring', bounce: 0.35, visualDuration: 0.6, delay: (delayMs || 0) / 1000 }
      : { duration: 0.8, ease: EASE, delay: (delayMs || 0) / 1000 });
    var done = function () { el.style.opacity = ''; el.style.transform = ''; };
    if (a && a.finished) a.finished.then(done, done); else done();
    el.__flDone = true;
    return a;
  }
  api.reveal = function (el) { if (M && !api.reduced) playReveal(el, 0); };

  function initReveal() {
    if (!M || api.reduced) return;
    var singles = qsa('[data-reveal]');
    var groups = qsa('[data-stagger]');
    var staggered = [];
    groups.forEach(function (g) {
      var kind = g.getAttribute('data-stagger') || 'up';
      Array.prototype.forEach.call(g.children, function (c, i) {
        if (c.hasAttribute('data-reveal')) return;
        c.__flIndex = i; setFrom(c, kind || 'up'); staggered.push(c);
      });
    });
    singles.forEach(function (el) { setFrom(el, el.getAttribute('data-reveal') || 'up'); });
    var items = singles.concat(staggered);
    if (!items.length) return;
    // failsafe: never leave content hidden if something goes wrong
    setTimeout(function () { hidden.forEach(function (el) { if (!el.__flDone) { el.style.opacity = ''; el.style.transform = ''; } }); }, 6000);
    M.inView(items, function (el) {
      var d = num(el.getAttribute('data-reveal-delay'), 0);
      if (el.__flIndex !== undefined) d += Math.min(el.__flIndex, 8) * 70;
      playReveal(el, d);
    }, { amount: 0.18, margin: '0px 0px -6% 0px' });
  }

  /* ───────── headline word reveal ───────── */
  function initSplit() {
    if (!M || api.reduced) return;
    qsa('[data-split]').forEach(function (el) {
      if (el.__flSplit) return; el.__flSplit = true;
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', text);
      var spans = [], out = doc.createDocumentFragment();
      // words rise one by one; inline children (e.g. <mark class="fl-marker">) are kept and split in place
      var emit = function (parent, str) {
        str.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { parent.appendChild(doc.createTextNode(' ')); return; }
          var wrap = doc.createElement('span');
          wrap.setAttribute('aria-hidden', 'true');
          wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em';
          var inner = doc.createElement('span');
          inner.style.cssText = 'display:inline-block;transform:translateY(110%)';
          inner.textContent = w;
          wrap.appendChild(inner);
          parent.appendChild(wrap);
          spans.push(inner);
        });
      };
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3) emit(out, n.nodeValue.replace(/\s+/g, ' '));
        else if (n.nodeType === 1) { var c = n.cloneNode(false); emit(c, n.textContent.replace(/\s+/g, ' ')); out.appendChild(c); }
      });
      el.innerHTML = '';
      el.appendChild(out);
      var run = function () {
        M.animate(spans, { transform: ['translateY(110%)', 'translateY(0%)'] }, { duration: 0.9, ease: EASE, delay: M.stagger(0.07) });
      };
      var rect = el.getBoundingClientRect();
      if (rect.top < root.innerHeight) run(); else M.inView(el, function () { run(); }, { amount: 0.4 });
    });
  }

  /* ───────── pointer tilt + magnet ───────── */
  function initTilt() {
    if (!M || api.reduced || !finePointer) return;
    qsa('[data-tilt]').forEach(function (el) {
      var max = num(el.getAttribute('data-tilt'), 8);
      var raf = 0, rx = 0, ry = 0;
      function apply() { raf = 0; el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        ry = px * max * 2; rx = -py * max * 2;
        if (!raf) raf = root.requestAnimationFrame(apply);
      });
      el.addEventListener('pointerleave', function () {
        if (raf) { root.cancelAnimationFrame(raf); raf = 0; }
        M.animate(el, { transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)' }, { type: 'spring', bounce: 0.35, visualDuration: 0.6 });
      });
    });
    qsa('[data-magnet]').forEach(function (el) {
      var k = num(el.getAttribute('data-magnet'), 0.25);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * k, dy = (e.clientY - (r.top + r.height / 2)) * k;
        M.animate(el, { x: dx, y: dy }, { type: 'spring', bounce: 0.2, visualDuration: 0.3 });
      });
      el.addEventListener('pointerleave', function () { M.animate(el, { x: 0, y: 0 }, { type: 'spring', bounce: 0.45, visualDuration: 0.6 }); });
    });
  }

  /* ───────── parallax ───────── */
  function initParallax() {
    if (!M || api.reduced) return;
    var items = qsa('[data-parallax]');
    if (!items.length) return;
    var ticking = false;
    var state = items.map(function (el) { return { el: el, k: num(el.getAttribute('data-parallax'), 0.1), vis: false }; });
    if (root.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { for (var i = 0; i < state.length; i++) if (state[i].el === e.target) state[i].vis = e.isIntersecting; }); update(); }, { rootMargin: '20% 0px' });
      state.forEach(function (s) { io.observe(s.el); });
    } else state.forEach(function (s) { s.vis = true; });
    function update() {
      ticking = false;
      var vh = root.innerHeight;
      for (var i = 0; i < state.length; i++) {
        var s = state[i]; if (!s.vis) continue;
        var r = s.el.getBoundingClientRect();
        var d = (r.top + r.height / 2 - vh / 2);
        s.el.style.translate = '0 ' + (-d * s.k).toFixed(1) + 'px';
      }
    }
    root.addEventListener('scroll', function () { if (!ticking) { ticking = true; root.requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ───────── counters ───────── */
  function initCount() {
    if (!M) return;
    qsa('[data-count]').forEach(function (el) {
      var end = num(el.getAttribute('data-count'), 0), suffix = el.getAttribute('data-count-suffix') || '';
      if (api.reduced) { el.textContent = end.toLocaleString() + suffix; return; }
      el.textContent = '0' + suffix;
      M.inView(el, function () {
        M.animate(0, end, { duration: 1.4, ease: EASE, onUpdate: function (v) { el.textContent = Math.round(v).toLocaleString() + suffix; } });
      }, { amount: 0.6 });
    });
  }

  /* ───────── marquee ───────── */
  function initMarquee() {
    qsa('.fl-marquee__track').forEach(function (t) {
      if (t.__flCloned) return; t.__flCloned = true;
      var kids = Array.prototype.slice.call(t.children);
      kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('id'); t.appendChild(c); });
    });
  }

  /* ───────── scroll tracker (shared by the floating nav and the section nav) ─────────
     The floating nav slides out at the reader's own scroll pace (a slow scroll slides it slowly,
     a flick slides it fast) and eases the rest of the way when they stop; scrolling back up
     brings it back the same way. Pattern borrowed from hhmb. */
  var scrollers = [];
  var lastY = root.scrollY || 0, ticking = false, settleTimer = 0;
  function onScroll() {
    if (ticking) return; ticking = true;
    root.requestAnimationFrame(function () {
      ticking = false;
      var y = root.scrollY > 0 ? root.scrollY : 0, dy = y - lastY; lastY = y;
      for (var i = 0; i < scrollers.length; i++) scrollers[i](y, dy);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () { for (var j = 0; j < scrollers.length; j++) if (scrollers[j].settle) scrollers[j].settle(); }, 150);
    });
  }
  function trackScroll(fn, settle) { fn.settle = settle; scrollers.push(fn); if (scrollers.length === 1) root.addEventListener('scroll', onScroll, { passive: true }); }
  function clampN(n, a, b) { return Math.min(b, Math.max(a, n)); }

  /* ───────── nav + menu ───────── */
  var PACE = 0.55;
  function initNav() {
    var nav = doc.querySelector('.fl-nav[data-autohide]');
    if (nav) {
      var shift = 0, dirn = 0, hold = false;
      var full = function () { return nav.offsetHeight + 6; };
      var put = function (px, ms) { nav.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.16,1,.3,1)' : 'none'; nav.style.transform = px ? 'translateY(' + (-px) + 'px)' : ''; nav.classList.toggle('is-away', px >= full()); };
      trackScroll(function (y, dy) {
        if (Math.abs(dy) > 1) dirn = dy > 0 ? 1 : -1;
        if (api.reduced) { var away = y > 160 && dirn > 0; shift = away ? full() : 0; put(shift, 0); return; }
        shift = (y < 8 || hold || nav.matches(':focus-within')) ? 0 : clampN(shift + dy * PACE, 0, full());
        put(shift, 0);
      }, function () {
        if (api.reduced || shift <= 0 || shift >= full()) return;
        var to = dirn > 0 ? full() : 0, ms = Math.round(clampN(Math.abs(to - shift) * 7, 200, 600));
        shift = to; put(shift, ms);
      });
      nav.addEventListener('focusin', function () { hold = true; shift = 0; put(0, 200); });
      nav.addEventListener('focusout', function () { hold = false; });
      api.navShift = function () { return shift; };
    }
    var toggle = doc.querySelector('.fl-nav__toggle');
    var menu = doc.querySelector('.fl-menu');
    if (toggle && menu) {
      var open = false;
      var set = function (v) {
        open = v;
        toggle.setAttribute('aria-expanded', String(v));
        menu.classList.toggle('is-open', v);
        doc.documentElement.style.overflow = v ? 'hidden' : '';
        if (M && !api.reduced && v) {
          M.animate(menu, { opacity: [0, 1], clipPath: ['circle(0% at calc(100% - 40px) 36px)', 'circle(150% at calc(100% - 40px) 36px)'] }, { duration: 0.6, ease: EASE });
          M.animate(qsa('a', menu), { opacity: [0, 1], y: [24, 0] }, { delay: M.stagger(0.06, { startDelay: 0.15 }), duration: 0.6, ease: EASE });
        }
      };
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function () { set(!open); });
      menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { set(false); toggle.focus(); } });
    }
  }

  /* ───────── section nav ─────────
     Mark sections with data-section="Label" (id optional; one is made if missing).
     Wide screens: a dot rail in the right margin. Narrow screens: a small pill at the bottom
     (previous / current / next) with a popover list, sliding at scroll pace like the top nav.
       Flavida.sectionNav({ sections: '[data-section]', label: fn, min: 3, bottom: '14px' }) */
  var snavBuilt = null;
  api.sectionNav = function (opts) {
    opts = opts || {};
    if (snavBuilt) return snavBuilt;
    var list = typeof opts.sections === 'string' || !opts.sections ? qsa(opts.sections || '[data-section]') : Array.prototype.slice.call(opts.sections);
    var min = opts.min || 3;
    if (list.length < min) return null;
    var labelOf = opts.label || function (el) { return el.getAttribute('data-section') || (el.querySelector('h1,h2') || el).textContent.replace(/\s+/g, ' ').trim().slice(0, 28); };
    var used = {};
    list.forEach(function (el, i) {
      if (!el.id) { var base = (labelOf(el) || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'; var id = base, n = 2; while (used[id] || doc.getElementById(id)) id = base + '-' + (n++); el.id = id; }
      used[el.id] = 1;
    });
    doc.documentElement.classList.add('has-snav');
    var items = list.map(function (el, i) { return '<li><a href="#' + el.id + '" data-i="' + i + '"><span class="fl-snav__dot" aria-hidden="true"></span><span class="fl-snav__label">' + labelOf(el).replace(/</g, '&lt;') + '</span></a></li>'; }).join('');
    var arrow = function (up) { return '<svg class="fl-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (up ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6') + '"/></svg>'; };
    var nav = doc.createElement('nav'); nav.className = 'fl-snav'; nav.setAttribute('aria-label', opts.ariaLabel || 'Jump to a section');
    if (opts.bottom) nav.style.setProperty('--fl-snav-bottom', opts.bottom);
    var id = 'fl-snav-list';
    nav.innerHTML = '<ol class="fl-snav__rail">' + items + '</ol>' +
      '<div class="fl-snav__pill"><button class="fl-snav__step" type="button" data-dir="-1" aria-label="Previous section">' + arrow(true) + '</button>' +
      '<button class="fl-snav__title" type="button" popovertarget="' + id + '" aria-controls="' + id + '" aria-expanded="false"><span class="fl-snav__count"></span><span class="fl-snav__name"></span></button>' +
      '<button class="fl-snav__step" type="button" data-dir="1" aria-label="Next section">' + arrow(false) + '</button></div>' +
      '<div class="fl-snav__list" id="' + id + '" popover><ol>' + items + '</ol></div>';
    doc.body.appendChild(nav);
    var pill = nav.querySelector('.fl-snav__pill'), title = nav.querySelector('.fl-snav__title'), pop = nav.querySelector('.fl-snav__list');
    var nameEl = nav.querySelector('.fl-snav__name'), countEl = nav.querySelector('.fl-snav__count');
    var links = qsa('a[data-i]', nav), tops = [], active = -1, listOpen = false, pshift = 0, dirn = 0;
    var measure = function () { tops = list.map(function (el) { return el.getBoundingClientRect().top + root.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0); }); };
    var mark = function (y) {
      var line = y + root.innerHeight * 0.33, i = 0;
      for (var k = 0; k < tops.length; k++) if (tops[k] <= line) i = k;
      if (i === active) return;
      active = i; nameEl.textContent = labelOf(list[i]); countEl.textContent = (i + 1) + '/' + list.length;
      links.forEach(function (a) { if (+a.dataset.i === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    var pillFull = function () { return pill.offsetHeight + 48; };
    var pillPut = function (px, ms) { pshift = px; pill.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.16,1,.3,1)' : 'none'; pill.style.transform = 'translateY(' + px + 'px)'; nav.classList.toggle('is-shown', px < pillFull() / 2); };
    var pastStart = function () { return root.scrollY > Math.min(root.innerHeight * 0.6, (tops[1] || 9999) * 0.75); };
    var pinned = function () { return listOpen || nav.matches(':focus-within'); };
    var settleIn = function () { var to = (pastStart() || pinned()) ? 0 : pillFull(); if (to !== pshift) pillPut(to, Math.round(clampN(Math.abs(to - pshift) * 7, 200, 600))); };
    var jump = function (i) {
      measure(); var n = clampN(i, 0, list.length - 1), el = list[n];
      var gap = nav.__gap || 0;
      root.scrollTo({ top: Math.max(0, tops[n] - gap), behavior: api.reduced ? 'auto' : 'smooth' });
      var h = el.querySelector('h1,h2,h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      if (history.replaceState) history.replaceState(null, '', '#' + el.id);
    };
    measure(); mark(root.scrollY); pillPut(pastStart() ? 0 : pillFull(), 0);
    trackScroll(function (y, dy) {
      if (Math.abs(dy) > 1) dirn = dy > 0 ? 1 : -1;
      mark(y);
      if (pinned() || api.reduced) { pillPut(pastStart() || pinned() ? 0 : pillFull(), 0); return; }
      if (!pastStart()) { pillPut(pillFull(), 0); return; }
      pillPut(clampN(pshift + dy * PACE, 0, pillFull()), 0);
    }, function () { if (!api.reduced) settleIn(); });
    nav.addEventListener('click', function (e) {
      var st = e.target.closest('[data-dir]');
      if (st) { var inside = root.scrollY > tops[active] + 60; jump(+st.dataset.dir < 0 ? (inside ? active : active - 1) : active + 1); return; }
      var a = e.target.closest('a[data-i]');
      if (a) { e.preventDefault(); if (pop.matches && pop.matches(':popover-open')) pop.hidePopover(); jump(+a.dataset.i); }
    });
    if (typeof pop.showPopover === 'function') pop.addEventListener('toggle', function (e) { listOpen = e.newState === 'open'; title.setAttribute('aria-expanded', String(listOpen)); settleIn(); });
    else { pop.removeAttribute('popover'); title.removeAttribute('popovertarget'); title.addEventListener('click', function () { pop.classList.toggle('is-open'); listOpen = pop.classList.contains('is-open'); title.setAttribute('aria-expanded', String(listOpen)); }); }
    nav.addEventListener('focusin', settleIn); nav.addEventListener('focusout', function () { setTimeout(settleIn); });
    if (root.ResizeObserver) new ResizeObserver(function () { measure(); mark(root.scrollY); }).observe(doc.body);
    root.addEventListener('load', function () { measure(); mark(root.scrollY); });
    snavBuilt = { el: nav, jump: jump, refresh: function () { measure(); mark(root.scrollY); } };
    return snavBuilt;
  };

  /* ───────── tabs ───────── */
  function initTabs() {
    qsa('.fl-tabs').forEach(function (list) {
      var tabs = qsa('[role="tab"]', list);
      if (!tabs.length) return;
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          var panel = doc.getElementById(t.getAttribute('aria-controls'));
          if (panel) {
            if (on) {
              panel.hidden = false;
              if (M && !api.reduced) M.animate(panel, { opacity: [0, 1], y: [10, 0] }, { duration: 0.45, ease: EASE });
            } else panel.hidden = true;
          }
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, j = -1;
          if (k === 'ArrowRight') j = (i + 1) % tabs.length;
          else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
          else if (k === 'Home') j = 0; else if (k === 'End') j = tabs.length - 1;
          if (j > -1) { e.preventDefault(); select(tabs[j], true); }
        });
      });
      select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
    });
  }

  /* ───────── mascot that follows the page ───────── */
  function initGuide() {
    if (!M) return;
    var guide = doc.querySelector('flav-mascot[data-guide]');
    if (!guide) return;
    qsa('[data-pose-on-view]').forEach(function (sec) {
      M.inView(sec, function () {
        var p = sec.getAttribute('data-pose-on-view');
        var ctl = guide.__flav || guide.controller;
        if (ctl && ctl.setPose) ctl.setPose(p); else guide.setAttribute('pose', p);
      }, { amount: 0.5 });
    });
  }

  /* ───────── toast ───────── */
  api.toast = function (msg, opts) {
    opts = opts || {};
    var region = doc.querySelector('.fl-toast-region');
    if (!region) {
      region = doc.createElement('div');
      region.className = 'fl-toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      doc.body.appendChild(region);
    }
    var t = doc.createElement('div');
    t.className = 'fl-toast';
    var pose = opts.pose || 'joy';
    var base = opts.base || '';
    t.innerHTML = '<img alt="" width="40" height="40" src="' + base + 'assets/flav/sticker/flav-' + pose + '.webp"><span></span>';
    t.lastChild.textContent = msg;
    region.appendChild(t);
    if (M && !api.reduced) M.animate(t, { opacity: [0, 1], y: [30, 0], scale: [0.9, 1] }, { type: 'spring', bounce: 0.3, visualDuration: 0.5 });
    setTimeout(function () {
      var done = function () { t.remove(); };
      if (M && !api.reduced) { var a = M.animate(t, { opacity: 0, y: 12, scale: 0.96 }, { duration: 0.22, ease: 'easeIn' }); a.finished.then(done, done); } else done();
    }, opts.duration || 2800);
  };

  /* ───────── boot ───────── */
  /* marker highlight: paint .fl-marker[data-draw] in when it scrolls into view (data-draw="300" = delay in ms) */
  function initMarkers() {
    var els = qsa('.fl-marker[data-draw]'); if (!els.length) return;
    if (api.reduced || !('IntersectionObserver' in root)) { els.forEach(function (e) { e.classList.add('is-drawn'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; var e = en.target, d = +e.getAttribute('data-draw') || 0;
        if (d) e.style.transitionDelay = d + 'ms'; e.classList.add('is-drawn'); io.unobserve(e);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  function boot() {
    try {
      doc.documentElement.classList.add('js');
      injectIcons();
      initMarquee();
      initNav();
      initTabs();
      initCount();
      initSplit();
      initReveal();
      initTilt();
      initParallax();
      initGuide();
      initMarkers();
      if (!doc.documentElement.hasAttribute('data-no-snav')) api.sectionNav();
    } catch (err) {
      if (root.console) console.warn('[Flavida] enhancement failed, page left visible:', err);
      qsa('[data-reveal],[data-stagger] > *').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();

  root.Flavida = api;
})(typeof window !== 'undefined' ? window : this);
