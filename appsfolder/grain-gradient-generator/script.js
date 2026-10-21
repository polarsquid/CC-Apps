(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Settings. Tweak these to change the feel of the piece.
  // ---------------------------------------------------------------------------
  const CONFIG = {
    maxBlobs: 7,          // hard limit (must match MAX_BLOBS in the shader)
    minBlobs: 2,
    grainPx: 3,           // size of one grain in CSS pixels (higher = coarser)
    grainFps: 0,          // how often the grain pattern re-rolls (0 = still)
    grainAmount: 0.11,    // strength of the noise grain
    levels: 10,           // colour levels per channel after dithering (lower = more lo-fi)
    idleDelay: 3000,      // ms without movement before the gradient drifts on its own
    idleSpeed: 1,         // how fast the idle drift and swirl move (0 = hold still)
    randomness: 0.7,      // 0 = smooth repeating loop and steady orbits; 1 = unpredictable
    followEase: 3.2,      // how quickly the main blob catches the cursor
    idleEase: 0.9,        // how quickly it settles into the drift path
    trailEase: 1.6,       // how loosely the other blobs trail behind
    spread: 0.06,         // how much the colours blend into each other (higher = more mixing)
    softness: 0.7,        // 0 = tight, defined edges; 1 = soft, hazy falloff
    wobble: 0.2,          // how much the blob outlines warp and ripple (0 = perfectly round)

    // Mark mode (Marks tab)
    markMode: false,      // replace each grid cell with a mark
    markPick: 'tone',     // 'tone' = brightness picks the level, 'blob' = nearest blob does
    markHex: false,       // offset alternate rows into a hex grid
    markInvert: false,    // flip the brightness mapping
    markBg: '#120f17',    // background behind the marks
    markBgGradient: false,// show the plain gradient behind the marks instead
    markCell: 18,         // grid cell size in CSS px
    markGap: 0.12,        // space around each mark (fraction of the cell)
    markScatter: 0,       // random nudge within each cell's free space
    markMin: 0.35,        // mark size at the darkest tone
    markMax: 1,           // mark size at the brightest tone
    markDither: 0.5,      // noise that mixes neighbouring levels (the grain, as marks)
    markContrast: 1.6,    // spreads the gradient's tones across the levels
    markBias: 0.5,        // shifts every tone lighter (>0.5) or darker (<0.5)
    markSwitch: 0,        // share of cells that randomly swap to a nearby level
    markReach: 1,         // how many levels away a swap can jump
    markHold: 0.6,        // seconds each random arrangement holds
  };

  // Ranges for the settings dialog. Values typed outside a range snap to the
  // nearest limit; whole-number settings are rounded.
  // Settings shown in the panel. Each one becomes a fader channel in its bank.
  // To add a control later, add a CONFIG default and a line here (new bank
  // names create new banks). Values typed outside a range snap to the nearest
  // limit; whole-number settings are rounded.
  const SETTINGS = [
    { key: 'grainPx',     bank: 'Grain',  name: 'Size',     unit: 'px',  label: 'Grain size',            min: 1,   max: 30,     step: 1,   int: true },
    { key: 'grainAmount', bank: 'Grain',  name: 'Strength', unit: '',    label: 'Grain strength',        min: 0,   max: 0.8,   step: 0.01 },
    { key: 'grainFps',    bank: 'Grain',  name: 'Flicker',  unit: 'fps', label: 'Grain flicker',         min: 0,   max: 60,    step: 1,   int: true },
    { key: 'levels',      bank: 'Grain',  name: 'Levels',   unit: '',    label: 'Colour levels',         min: 2,   max: 12,    step: 1,   int: true },
    { key: 'idleDelay',   bank: 'Motion', name: 'Delay',    unit: 'ms',  label: 'Drift after idle',      min: 500, max: 10000, step: 100, int: true },
    { key: 'idleSpeed',   bank: 'Motion', name: 'Wander',   unit: '',    label: 'Idle drift speed',      min: 0,   max: 5,     step: 0.05 },
    { key: 'randomness',  bank: 'Motion', name: 'Random',   unit: '',    label: 'Movement randomness',   min: 0,   max: 1,     step: 0.01 },
    { key: 'followEase',  bank: 'Motion', name: 'Follow',   unit: '',    label: 'Cursor follow speed',   min: 0.2, max: 10,    step: 0.1 },
    { key: 'idleEase',    bank: 'Motion', name: 'Settle',   unit: '',    label: 'Drift settle speed',    min: 0.1, max: 5,     step: 0.1 },
    { key: 'trailEase',   bank: 'Motion', name: 'Trail',    unit: '',    label: 'Trail tightness',       min: 0.2, max: 6,     step: 0.1 },
    { key: 'spread',      bank: 'Shape',  name: 'Blend',    unit: '',    label: 'Colour blend',         min: 0.01, max: 1,    step: 0.01 },
    { key: 'softness',    bank: 'Shape',  name: 'Softness', unit: '',    label: 'Edge softness',         min: 0,   max: 1,     step: 0.01 },
    { key: 'wobble',      bank: 'Shape',  name: 'Wobble',   unit: '',    label: 'Wobble',                min: 0,   max: 1,     step: 0.01 },
  ];
  // Faders on the Marks tab, built exactly like the Gradient tab's.
  const MARK_SETTINGS = [
    { key: 'markCell',     bank: 'Grid',   name: 'Cell',     unit: 'px', label: 'Mark cell size',         min: 4,   max: 96,  step: 1,    int: true },
    { key: 'markGap',      bank: 'Grid',   name: 'Gap',      unit: '',   label: 'Gap around marks',       min: 0,   max: 0.9, step: 0.01 },
    { key: 'markScatter',  bank: 'Grid',   name: 'Scatter',  unit: '',   label: 'Mark scatter',           min: 0,   max: 1,   step: 0.01 },
    { key: 'markMin',      bank: 'Size',   name: 'Min',      unit: '',   label: 'Smallest mark size',     min: 0,   max: 1,   step: 0.01 },
    { key: 'markMax',      bank: 'Size',   name: 'Max',      unit: '',   label: 'Largest mark size',      min: 0,   max: 1,   step: 0.01 },
    { key: 'markDither',   bank: 'Size',   name: 'Dither',   unit: '',   label: 'Dither between levels',  min: 0,   max: 1,   step: 0.01 },
    { key: 'markContrast', bank: 'Tone',   name: 'Contrast', unit: '',   label: 'Tone contrast',          min: 0.2, max: 4,   step: 0.05 },
    { key: 'markBias',     bank: 'Tone',   name: 'Bias',     unit: '',   label: 'Tone bias',              min: 0,   max: 1,   step: 0.01 },
    { key: 'markSwitch',   bank: 'Switch', name: 'Amount',   unit: '',   label: 'Random switch amount',   min: 0,   max: 1,   step: 0.01 },
    { key: 'markReach',    bank: 'Switch', name: 'Reach',    unit: '',   label: 'Random switch reach',    min: 1,   max: 4,   step: 1,    int: true },
    { key: 'markHold',     bank: 'Switch', name: 'Hold',     unit: 's',  label: 'Hold each arrangement',  min: 0.1, max: 5,   step: 0.05 },
  ];

  const CONFIG_DEFAULTS = { ...CONFIG };

  const DEFAULT_COLOURS = ['#f23c8a', '#e89c2d', '#1c3c6a'];
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  const canvas = document.getElementById('field');
  const list = document.getElementById('swatches');
  const rail = document.getElementById('rail');
  const addBtn = document.getElementById('add-blob');
  const settingsBtn = document.getElementById('open-settings');
  const dialog = document.getElementById('settings');
  const settingsBody = document.getElementById('settings-body');
  const hint = document.getElementById('hint');
  const fallback = document.getElementById('fallback');
  const announcer = document.getElementById('announcer');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (coarsePointer) hint.textContent = 'Tap anywhere for new colours';

  // ---------------------------------------------------------------------------
  // Colour helpers
  // ---------------------------------------------------------------------------
  const randomHex = () =>
    '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  };

  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  // Blending happens in OKLab so mixes between any two colours stay vivid
  // instead of going muddy in the middle.
  const hexToOklab = (hex) => {
    const [r, g, b] = hexToRgb(hex).map(toLinear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  };

  const luminance = (hex) => {
    const [r, g, b] = hexToRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Pick black or white text, whichever contrasts more with the swatch.
  const inkFor = (hex) => {
    const L = luminance(hex);
    return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#141019' : '#fbf7ff';
  };

  // ---------------------------------------------------------------------------
  // Blobs
  // ---------------------------------------------------------------------------
  const state = {
    blobs: [],
    pointer: { x: 0.5, y: 0.5, seen: false, last: -Infinity },
    anchor: { x: 0.5, y: 0.5 },
    simTime: 0,
    wanderTime: 0,
    forceIdle: false,   // set by the Idle switch or the "i" key
    overPanel: false,   // pointer is inside the settings panel
    hasRandomised: false,
  };

  function makeBlob(hex, index) {
    return {
      hex,
      lab: hexToOklab(hex),
      locked: false,
      x: state.anchor.x,
      y: state.anchor.y,
      theta: index * GOLDEN_ANGLE * 2.1,
      speed: 0.1 + Math.random() * 0.08,
      orbit: 0.22 + Math.random() * 0.14,
      phase: Math.random() * Math.PI * 2,
      radius: 0.32 + Math.random() * 0.1,
      seed: Math.random() * 1000, // drives this blob's irregular orbit
    };
  }

  function setColour(blob, hex) {
    blob.hex = hex;
    blob.lab = hexToOklab(hex);
  }

  function randomise() {
    let changed = 0;
    for (const blob of state.blobs) {
      if (!blob.locked) {
        setColour(blob, randomHex());
        changed++;
      }
    }
    syncSwatches();
    if (changed) announce(`New colours: ${state.blobs.map((b) => b.hex).join(', ')}`);
    else announce('All colours are locked. Unlock one to change it.');

    if (!state.hasRandomised) {
      state.hasRandomised = true;
      hint.classList.remove('is-visible');
      hint.classList.add('is-gone');
    }
  }

  function addBlob(hex) {
    if (state.blobs.length >= CONFIG.maxBlobs) return false;
    state.blobs.push(makeBlob(hex || randomHex(), state.blobs.length));
    syncSwatches();
    return true;
  }

  function removeBlob(index = state.blobs.length - 1) {
    if (state.blobs.length <= CONFIG.minBlobs) return false;
    if (index < 0 || index >= state.blobs.length) return false;
    state.blobs.splice(index, 1);
    syncSwatches();
    return true;
  }

  DEFAULT_COLOURS.forEach((hex, i) => state.blobs.push(makeBlob(hex, i)));

  // ---------------------------------------------------------------------------
  // Swatches
  // ---------------------------------------------------------------------------
  const LOCK_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
         stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path class="shackle" d="M8 11V8a4 4 0 0 1 8 0v3"/>
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" stroke="none"/>
    </svg>`;

  const X_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
         stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>`;

  function buildSwatch(i) {
    const li = document.createElement('li');
    li.className = 'swatch';
    li.innerHTML = `
      <button class="lock" type="button" aria-pressed="false">${LOCK_ICON}</button>
      <div class="chip-wrap">
        <button class="chip" type="button"><span class="hex"></span></button>
        <button class="remove" type="button">${X_ICON}</button>
      </div>`;

    li.querySelector('.lock').addEventListener('click', () => {
      const blob = state.blobs[i];
      blob.locked = !blob.locked;
      syncSwatches();
      announce(`${blob.hex} ${blob.locked ? 'locked' : 'unlocked'}`);
    });

    li.querySelector('.chip').addEventListener('click', () => copyHex(i, li));

    li.querySelector('.remove').addEventListener('click', () => {
      const hex = state.blobs[i].hex;
      if (!removeBlob(i)) return;
      announce(`Removed ${hex}`);
      const next = list.children[Math.min(i, list.children.length - 1)];
      next.querySelector('.chip').focus();
    });
    return li;
  }

  let onColoursChanged = () => {}; // set up by the settings panel

  function syncSwatches() {
    if (list.children.length !== state.blobs.length) {
      list.replaceChildren(...state.blobs.map((_, i) => buildSwatch(i)));
      rail.style.setProperty('--count', state.blobs.length + 1);
    }
    const canRemove = state.blobs.length > CONFIG.minBlobs;
    addBtn.hidden = state.blobs.length >= CONFIG.maxBlobs;
    state.blobs.forEach((blob, i) => {
      const li = list.children[i];
      const chip = li.querySelector('.chip');
      const lock = li.querySelector('.lock');
      const label = chip.querySelector('.hex');
      chip.style.setProperty('--c', blob.hex);
      chip.style.setProperty('--on-c', inkFor(blob.hex));
      if (!li.dataset.copying) label.textContent = blob.hex;
      chip.setAttribute('aria-label', `Copy ${blob.hex}`);
      lock.setAttribute('aria-pressed', String(blob.locked));
      lock.setAttribute('aria-label', `${blob.locked ? 'Unlock' : 'Lock'} ${blob.hex}`);
      const remove = li.querySelector('.remove');
      remove.hidden = !canRemove;
      remove.setAttribute('aria-label', `Remove ${blob.hex}`);
      li.classList.toggle('is-locked', blob.locked);
    });
    onColoursChanged();
  }

  async function copyHex(i, li) {
    const hex = state.blobs[i].hex;
    let ok = false;
    try {
      await navigator.clipboard.writeText(hex);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = hex;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }

    const label = li.querySelector('.hex');
    li.dataset.copying = '1';
    label.textContent = ok ? 'copied' : 'failed';
    announce(ok ? `Copied ${hex}` : `Couldn't copy ${hex}. Select it manually.`);
    clearTimeout(li._copyTimer);
    li._copyTimer = setTimeout(() => {
      delete li.dataset.copying;
      syncSwatches();
    }, 1100);
  }

  function announce(msg) {
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = msg; });
  }

  syncSwatches();

  addBtn.addEventListener('click', () => {
    if (!addBlob()) return;
    const hex = state.blobs[state.blobs.length - 1].hex;
    announce(`Added ${hex}`);
    if (addBtn.hidden) list.lastElementChild.querySelector('.chip').focus();
  });

  // ---------------------------------------------------------------------------
  // Settings dialog
  // ---------------------------------------------------------------------------
  const decimals = (n) => (String(n).split('.')[1] || '').length;

  function clampSetting(def, raw) {
    let v = Number(raw);
    if (!Number.isFinite(v)) return CONFIG[def.key];
    v = Math.min(def.max, Math.max(def.min, v));
    return def.int ? Math.round(v) : Math.round(v * 1000) / 1000;
  }

  const formatSetting = (def, v) =>
    def.int ? String(v) : String(Number(v.toFixed(Math.max(3, decimals(def.step)))));

  // Keep only digits and a single decimal point (none at all for whole numbers).
  function sanitise(text, allowDot) {
    let out = text.replace(allowDot ? /[^0-9.]/g : /[^0-9]/g, '');
    const dot = out.indexOf('.');
    if (dot !== -1) out = out.slice(0, dot + 1) + out.slice(dot + 1).replace(/\./g, '');
    return out;
  }

  const controls = {};
  let resizeCanvas = () => {}; // set once WebGL is ready

  function applySetting(def, value) {
    CONFIG[def.key] = value;
    const c = controls[def.key];
    c.range.value = value;
    c.text.value = formatSetting(def, value);
    c.strip.style.setProperty('--pct', `${((value - def.min) / (def.max - def.min)) * 100}%`);
    if (def.key === 'grainPx') resizeCanvas();
  }

  function buildChannel(def) {
    const id = `set-${def.key}`;
    const strip = document.createElement('div');
    strip.className = 'channel';
    strip.innerHTML = `
      <input class="readout" type="text" inputmode="${def.int ? 'numeric' : 'decimal'}"
             autocomplete="off" spellcheck="false"
             aria-label="${def.label} value, ${def.min} to ${def.max}">
      <span class="unit" aria-hidden="true">${def.unit || '&nbsp;'}</span>
      <div class="fader-wrap">
        <span class="slot" aria-hidden="true"><span class="fill"></span></span>
        <input class="fader" type="range" id="${id}" min="${def.min}" max="${def.max}"
               step="${def.step}" aria-label="${def.label}">
      </div>
      <label class="channel-name" for="${id}">${def.name}</label>`;

    const range = strip.querySelector('.fader');
    const text = strip.querySelector('.readout');
    controls[def.key] = { range, text, strip };

    range.addEventListener('input', () => applySetting(def, clampSetting(def, range.value)));

    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); text.blur(); return; }
      const allowed = def.int ? /^[0-9]$/ : /^[0-9.]$/;
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !allowed.test(e.key)) e.preventDefault();
    });

    text.addEventListener('input', () => {
      const clean = sanitise(text.value, !def.int);
      if (clean !== text.value) {
        const pos = Math.max(0, text.selectionStart - (text.value.length - clean.length));
        text.value = clean;
        text.setSelectionRange(pos, pos);
      }
    });

    text.addEventListener('focus', () => text.select());

    text.addEventListener('change', () => {
      const v = text.value.trim();
      applySetting(def, v === '' || v === '.' ? CONFIG[def.key] : clampSetting(def, v));
    });

    return strip;
  }

  // Group settings into banks in the order they first appear.
  function buildBanks(list, container, idPrefix) {
    const banks = new Map();
    list.forEach((def) => {
      if (!banks.has(def.bank)) {
        const bank = document.createElement('section');
        bank.className = 'bank';
        const headingId = `${idPrefix}-${def.bank.toLowerCase().replace(/\W+/g, '-')}`;
        bank.setAttribute('aria-labelledby', headingId);
        bank.innerHTML = `<h3 class="bank-name" id="${headingId}">${def.bank}</h3><div class="channels"></div>`;
        container.appendChild(bank);
        banks.set(def.bank, bank.querySelector('.channels'));
      }
      banks.get(def.bank).appendChild(buildChannel(def));
      applySetting(def, CONFIG[def.key]);
    });
  }
  buildBanks(SETTINGS, settingsBody, 'bank');

  // ----- Tint the panel from the live colours -----
  function oklabToHex([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    if (lin.some((c) => c < -0.0005 || c > 1.0005)) return null;
    return '#' + lin.map((c) => {
      c = Math.min(1, Math.max(0, c));
      const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
      return Math.round(v * 255).toString(16).padStart(2, '0');
    }).join('');
  }

  // Push a colour to a fixed light or dark lightness so text on it always
  // reads, keeping as much of its hue and colourfulness as fits in sRGB.
  function chassisFrom(hex) {
    const [L, a, b] = hexToOklab(hex);
    const dark = L < 0.6;
    const targetL = dark ? 0.3 : 0.86;
    const h = Math.atan2(b, a);
    let C = Math.min(Math.hypot(a, b), dark ? 0.16 : 0.13);
    let out = null;
    while (!(out = oklabToHex([targetL, C * Math.cos(h), C * Math.sin(h)])) && C > 0) C -= 0.005;
    return { panel: out || (dark ? '#2a2630' : '#e9e4ee'), dark };
  }

  let onThemeExtra = () => {}; // mark mode repaints its level strips here

  function themePanel() {
    const { panel, dark } = chassisFrom(state.blobs[0].hex);
    dialog.style.setProperty('--panel', panel);
    dialog.style.setProperty('--panel-ink', dark ? '#fbf7ff' : '#141019');
    // The chassis takes the cursor colour, so the faders cycle through the rest.
    const capColours = state.blobs.slice(1);
    let i = 0;
    for (const { strip } of Object.values(controls)) {
      const hex = capColours[i % capColours.length].hex;
      strip.style.setProperty('--cap', hex);
      strip.style.setProperty('--cap-ink', inkFor(hex));
      i++;
    }
    onThemeExtra();
  }
  onColoursChanged = themePanel;
  themePanel();

  // ----- Open, close, drag -----
  const MARGIN = 12;
  let placed = false;
  const panelPos = { x: 0, y: 0 };

  function placePanel(x, y) {
    const w = dialog.offsetWidth;
    const h = dialog.offsetHeight;
    panelPos.x = Math.min(Math.max(MARGIN, x), Math.max(MARGIN, window.innerWidth - w - MARGIN));
    panelPos.y = Math.min(Math.max(MARGIN, y), Math.max(MARGIN, window.innerHeight - h - MARGIN));
    dialog.style.left = `${panelPos.x}px`;
    dialog.style.top = `${panelPos.y}px`;
  }

  // Default spot: bottom right, tucked beside the swatch column if there's room.
  function dockPanel() {
    const w = dialog.offsetWidth;
    const railLeft = rail.getBoundingClientRect().left;
    const besideRail = railLeft - w - 16;
    const x = besideRail >= MARGIN ? besideRail : window.innerWidth - w - MARGIN;
    placePanel(x, window.innerHeight - dialog.offsetHeight - 24);
  }

  // ----- Resizing -----
  // The whole panel is drawn in units of --u, so resizing scales every part
  // of it (faders, text, buttons) together rather than rearranging it.
  const SCALE_MIN = 0.5;
  const SCALE_MAX = 1.6;
  const SCALE_DEFAULT = 0.8;
  let wantScale = SCALE_DEFAULT; // what the person chose
  let scale = SCALE_DEFAULT;     // what currently fits on screen

  function setUnit(sv) { dialog.style.setProperty('--u', `${sv}px`); }

  function applyScale(target) {
    let sv = Math.min(SCALE_MAX, Math.max(SCALE_MIN, target));
    setUnit(sv);
    // Shrink further if the panel would run off the screen from where it sits.
    const availW = window.innerWidth - panelPos.x - MARGIN;
    const availH = window.innerHeight - panelPos.y - MARGIN;
    // Measure the full content (not the clipped box), and repeat in case the
    // banks rewrap at the new size.
    for (let pass = 0; pass < 3; pass++) {
      const over = Math.max(dialog.scrollWidth / availW, dialog.scrollHeight / availH);
      if (over <= 1.001 || sv <= SCALE_MIN) break;
      sv = Math.max(SCALE_MIN, sv / over);
      setUnit(sv);
    }
    scale = sv;
    return sv;
  }

  const resizer = document.getElementById('settings-resize');
  let sizing = null;
  resizer.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    sizing = { id: e.pointerId, x: e.clientX, y: e.clientY, w: dialog.offsetWidth, h: dialog.offsetHeight, s: scale };
    resizer.setPointerCapture(e.pointerId);
    dialog.classList.add('is-resizing');
    e.preventDefault();
  });
  resizer.addEventListener('pointermove', (e) => {
    if (!sizing || sizing.id !== e.pointerId) return;
    // Average the horizontal and vertical stretch so a diagonal drag feels natural.
    const ratio = ((sizing.w + e.clientX - sizing.x) / sizing.w + (sizing.h + e.clientY - sizing.y) / sizing.h) / 2;
    wantScale = applyScale(sizing.s * ratio);
  });
  const endSize = (e) => {
    if (!sizing || sizing.id !== e.pointerId) return;
    sizing = null;
    dialog.classList.remove('is-resizing');
  };
  resizer.addEventListener('pointerup', endSize);
  resizer.addEventListener('pointercancel', endSize);
  resizer.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.15 : 0.05;
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    wantScale = applyScale(scale + dir * step);
  });

  // ----- Hide / show the tools -----
  // Hiding slides the swatch column off the right edge and closes the panel,
  // leaving only a small arrow; showing brings both back as they were.
  const collapseBtn = document.getElementById('collapse-tools');
  const revealBtn = document.getElementById('reveal-tools');
  let panelWasOpen = false;

  function setToolsHidden(hide) {
    document.body.classList.toggle('tools-hidden', hide);
    rail.inert = hide;
    revealBtn.hidden = !hide;
    if (hide) {
      closeMarkMenu(false);
      panelWasOpen = dialog.open;
      if (dialog.open) {
        dialog.close();
        settingsBtn.setAttribute('aria-expanded', 'false');
      }
      revealBtn.focus({ preventScroll: true });
    } else {
      if (panelWasOpen) openPanel();
      else collapseBtn.focus({ preventScroll: true });
    }
  }
  collapseBtn.addEventListener('click', () => setToolsHidden(true));
  revealBtn.addEventListener('click', () => setToolsHidden(false));

  // ----- Force idle -----
  const idleSwitch = document.getElementById('idle-switch');
  function setForceIdle(on) {
    state.forceIdle = on;
    idleSwitch.setAttribute('aria-checked', String(on));
    announce(on ? 'Idle on: the blobs ignore the cursor' : 'Idle off: the blobs follow the cursor');
  }
  idleSwitch.addEventListener('click', () => setForceIdle(!state.forceIdle));
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'i' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    e.preventDefault();
    setForceIdle(!state.forceIdle);
  });

  function openPanel() {
    dialog.show(); // non-modal: the gradient stays clickable behind it
    if (!placed) {
      panelPos.x = 0; panelPos.y = 0;
      applyScale(wantScale);
      dockPanel();
      placed = true;
    } else {
      placePanel(panelPos.x, panelPos.y);
      applyScale(wantScale);
    }
    settingsBtn.setAttribute('aria-expanded', 'true');
    dialog.querySelector('.fader').focus({ preventScroll: true });
  }

  function closePanel() {
    if (!dialog.open) return;
    const hadFocus = dialog.contains(document.activeElement);
    dialog.close();
    settingsBtn.setAttribute('aria-expanded', 'false');
    if (hadFocus) settingsBtn.focus();
  }

  settingsBtn.addEventListener('click', () => (dialog.open ? closePanel() : openPanel()));
  document.getElementById('close-settings').addEventListener('click', closePanel);
  // Reset affects only the tab that's showing. On the Marks tab it resets the
  // faders and toggles but leaves mark mode, levels and uploads alone.
  document.getElementById('reset-settings').addEventListener('click', () => {
    if (activeTab === 0) {
      SETTINGS.forEach((def) => applySetting(def, CONFIG_DEFAULTS[def.key]));
      announce('Gradient settings reset to defaults');
      return;
    }
    MARK_SETTINGS.forEach((def) => applySetting(def, CONFIG_DEFAULTS[def.key]));
    ['markPick', 'markHex', 'markInvert', 'markBg', 'markBgGradient'].forEach((k) => { CONFIG[k] = CONFIG_DEFAULTS[k]; });
    bgInput.value = CONFIG.markBg;
    syncTileBg();
    pick.sync();
    toggleSwitches.forEach((sw) => sw.sync());
    announce('Mark settings reset to defaults');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('mark-menu').hidden) { closeMarkMenu(true); return; }
    if (dialog.open) closePanel();
  });
  window.addEventListener('resize', () => {
    if (!dialog.open) return;
    placePanel(panelPos.x, panelPos.y);
    applyScale(wantScale);
    placePanel(panelPos.x, panelPos.y);
  });

  const grip = document.getElementById('settings-grip');
  let drag = null;
  grip.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.button !== 0) return;
    drag = { id: e.pointerId, dx: e.clientX - panelPos.x, dy: e.clientY - panelPos.y };
    grip.setPointerCapture(e.pointerId);
    dialog.classList.add('is-dragging');
    e.preventDefault();
  });
  grip.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    placePanel(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  const endDrag = (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    drag = null;
    dialog.classList.remove('is-dragging');
  };
  grip.addEventListener('pointerup', endDrag);
  grip.addEventListener('pointercancel', endDrag);

  // Keyboard users can nudge the panel with the arrow keys while the grip has focus.
  grip.tabIndex = 0;
  grip.setAttribute('aria-label', 'Move settings panel with arrow keys');
  grip.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 40 : 10;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!moves[e.key] || e.target !== grip) return;
    e.preventDefault();
    placePanel(panelPos.x + moves[e.key][0], panelPos.y + moves[e.key][1]);
  });

  // ---------------------------------------------------------------------------
  // Mark mode: tabs, toggles, levels and the mark picker
  // ---------------------------------------------------------------------------
  const { SHAPES, SLOT, drawShape, shapeThumb, processUpload } = window.GGMarks;
  const MAX_LEVELS = 12;
  const MIN_LEVELS = 2;
  const DEFAULT_LEVELS = [
    { colour: '#3d2a6b', shape: 'square' },
    { colour: '#6a2f8f', shape: 'diamond' },
    { colour: '#a3286b', shape: 'plus' },
    { colour: '#f23c8a', shape: 'ring' },
    { colour: '#e89c2d', shape: 'triangle' },
    { colour: '#fbf7ff', shape: 'circle' },
  ];
  const makeLevel = (d) => ({
    colour: d.colour, shape: d.shape, useGradient: false, scale: 1, upload: null, keepOriginal: false,
  });
  state.levels = DEFAULT_LEVELS.map(makeLevel);
  const shapeName = (id) => (SHAPES.find((sh) => sh.id === id) || SHAPES[0]).name;

  // ----- Atlas: every level's mark in one image the shader can read -----
  const ATLAS_GRID = 4; // 4 × 4 slots
  const MARK_FILL = 0.84; // marks fill this much of a slot; the margin keeps edges smooth
  const atlas = document.createElement('canvas');
  atlas.width = atlas.height = SLOT * ATLAS_GRID;
  const actx = atlas.getContext('2d');
  let atlasDirty = true;

  function drawAtlas() {
    actx.clearRect(0, 0, atlas.width, atlas.height);
    const inner = SLOT * MARK_FILL;
    state.levels.forEach((lv, i) => {
      const x = (i % ATLAS_GRID) * SLOT;
      const y = Math.floor(i / ATLAS_GRID) * SLOT;
      if (lv.upload) {
        const src = lv.keepOriginal ? lv.upload.orig : lv.upload.mask;
        actx.drawImage(src, x + (SLOT - inner) / 2, y + (SLOT - inner) / 2, inner, inner);
      } else {
        drawShape(actx, lv.shape, x + SLOT / 2, y + SLOT / 2, inner);
      }
    });
    atlasDirty = true;
  }

  // ----- Tabs -----
  const marksBody = document.getElementById('marks-body');
  const tabs = [document.getElementById('tab-gradient'), document.getElementById('tab-marks')];
  const tabPanels = [settingsBody, marksBody];
  let activeTab = 0;

  function selectTab(index, focus = false) {
    activeTab = index;
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === index));
      t.tabIndex = i === index ? 0 : -1;
      tabPanels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
    closeMarkMenu(false);
    if (dialog.open) {
      applyScale(wantScale);
      placePanel(panelPos.x, panelPos.y);
    }
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      selectTab((activeTab + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
    });
  });

  // ----- Toggle row -----
  function makeSwitch(label, ariaLabel, get, set) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-switch';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-label', ariaLabel);
    btn.innerHTML = `<span class="switch-label">${label}</span>
      <span class="switch-track" aria-hidden="true"><span class="switch-knob"></span></span>`;
    const sync = () => btn.setAttribute('aria-checked', String(get()));
    btn.addEventListener('click', () => { set(!get()); sync(); });
    sync();
    btn.sync = sync;
    return btn;
  }

  const toggleRow = document.getElementById('mark-toggles');
  const toggleSwitches = [];

  function setMarkMode(on) {
    CONFIG.markMode = on;
    canvas.classList.toggle('is-smooth', on);
    resizeCanvas();
    modeSwitch.sync();
    announce(on ? 'Mark mode on' : 'Mark mode off');
  }

  const modeSwitch = makeSwitch('Marks', 'Mark mode (M)', () => CONFIG.markMode, setMarkMode);
  modeSwitch.classList.add('is-main');
  modeSwitch.title = 'Mark mode (M)';
  toggleRow.appendChild(modeSwitch);

  // Pick each cell's level by brightness or by the nearest blob.
  const pick = document.createElement('div');
  pick.className = 'segmented';
  pick.setAttribute('role', 'radiogroup');
  pick.setAttribute('aria-label', 'Choose each mark by');
  pick.innerHTML = `<span class="segmented-label" aria-hidden="true">By</span>
    <button type="button" role="radio" data-pick="tone">Tone</button>
    <button type="button" role="radio" data-pick="blob">Blob</button>`;
  const pickButtons = [...pick.querySelectorAll('button')];
  function syncPick() {
    pickButtons.forEach((b) => {
      const on = b.dataset.pick === CONFIG.markPick;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }
  pickButtons.forEach((b) => {
    b.addEventListener('click', () => { CONFIG.markPick = b.dataset.pick; syncPick(); });
    b.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const other = pickButtons.find((o) => o !== b);
      other.click();
      other.focus();
    });
  });
  pick.sync = syncPick;
  syncPick();
  toggleRow.appendChild(pick);

  [
    makeSwitch('Hex', 'Hex grid', () => CONFIG.markHex, (v) => { CONFIG.markHex = v; }),
    makeSwitch('Invert', 'Invert tones', () => CONFIG.markInvert, (v) => { CONFIG.markInvert = v; }),
  ].forEach((sw) => { toggleRow.appendChild(sw); toggleSwitches.push(sw); });

  const bgGroup = document.createElement('div');
  bgGroup.className = 'bg-group';
  bgGroup.innerHTML = `<span class="segmented-label">Bg</span>
    <input type="color" class="colour-chip" aria-label="Background colour behind the marks">`;
  const bgInput = bgGroup.querySelector('input');
  bgInput.value = CONFIG.markBg;
  const syncTileBg = () => levelsBankEl().style.setProperty('--mark-bg', CONFIG.markBg);
  bgInput.addEventListener('input', () => { CONFIG.markBg = bgInput.value; syncTileBg(); });
  const bgGradSwitch = makeSwitch('Gradient', 'Show the gradient behind the marks',
    () => CONFIG.markBgGradient, (v) => { CONFIG.markBgGradient = v; });
  bgGroup.appendChild(bgGradSwitch);
  toggleSwitches.push(bgGradSwitch);
  toggleRow.appendChild(bgGroup);

  // ----- Mark faders, then the levels bank -----
  const marksBanks = document.getElementById('marks-banks');
  buildBanks(MARK_SETTINGS, marksBanks, 'mbank');

  const levelsBank = document.createElement('section');
  levelsBank.className = 'bank levels-bank';
  levelsBank.setAttribute('aria-labelledby', 'mbank-levels');
  levelsBank.innerHTML = `
    <div class="bank-head">
      <h3 class="bank-name" id="mbank-levels">Levels</h3>
      <span class="level-status" role="status"></span>
      <div class="bank-actions"></div>
    </div>
    <div class="channels level-channels"></div>`;
  marksBanks.appendChild(levelsBank);
  function levelsBankEl() { return levelsBank; }
  const levelChannels = levelsBank.querySelector('.level-channels');
  const levelStatus = levelsBank.querySelector('.level-status');
  const bankActions = levelsBank.querySelector('.bank-actions');

  const allGradSwitch = makeSwitch('All gradient', 'Use gradient colours for every level',
    () => state.levels.every((lv) => lv.useGradient),
    (v) => { state.levels.forEach((lv) => { lv.useGradient = v; }); refreshLevels(); });
  bankActions.appendChild(allGradSwitch);

  const restoreBtn = document.createElement('button');
  restoreBtn.type = 'button';
  restoreBtn.className = 'panel-reset is-small';
  restoreBtn.textContent = 'Restore';
  restoreBtn.title = 'Restore the six built-in levels';
  restoreBtn.addEventListener('click', () => {
    state.levels = DEFAULT_LEVELS.map(makeLevel);
    renderLevels();
    announce('Built-in levels restored');
  });
  bankActions.appendChild(restoreBtn);

  let statusTimer = 0;
  function showLevelStatus(msg) {
    levelStatus.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { levelStatus.textContent = ''; }, 4500);
  }

  const LEVEL_DEF = { key: 'levelScale', min: 0.2, max: 1.5, step: 0.05 };
  const clampLevelScale = (raw, fallback) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return fallback;
    return Math.round(Math.min(LEVEL_DEF.max, Math.max(LEVEL_DEF.min, v)) * 1000) / 1000;
  };

  const GRAD_ICON = '<span class="grad-dot" aria-hidden="true"></span>';

  function paintTile(lv, cv) {
    const ctx = cv.getContext('2d');
    const S = cv.width;
    const inner = S * 0.7;
    const o = (S - inner) / 2;
    ctx.clearRect(0, 0, S, S);
    if (lv.upload && lv.keepOriginal) {
      ctx.drawImage(lv.upload.orig, o, o, inner, inner);
      return;
    }
    if (lv.upload) ctx.drawImage(lv.upload.mask, o, o, inner, inner);
    else drawShape(ctx, lv.shape, S / 2, S / 2, inner);
    ctx.globalCompositeOperation = 'source-in';
    if (lv.useGradient) {
      const g = ctx.createLinearGradient(0, 0, S, S);
      const bl = state.blobs;
      bl.forEach((b, i) => g.addColorStop(bl.length > 1 ? i / (bl.length - 1) : 0, b.hex));
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = lv.colour;
    }
    ctx.fillRect(0, 0, S, S);
    ctx.globalCompositeOperation = 'source-over';
  }

  function buildLevelStrip(i) {
    const id = `level-${i}`;
    const strip = document.createElement('div');
    strip.className = 'channel level';
    strip.innerHTML = `
      <button type="button" class="mark-tile"><canvas width="96" height="96"></canvas></button>
      <div class="level-colour">
        <input type="color" class="colour-chip" aria-label="Level ${i + 1} colour">
        <button type="button" class="grad-toggle" aria-label="Level ${i + 1}: use the gradient's colour"
                title="Use the gradient's colour">${GRAD_ICON}</button>
      </div>
      <input class="readout" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
             aria-label="Level ${i + 1} mark size, ${LEVEL_DEF.min} to ${LEVEL_DEF.max}">
      <span class="unit" aria-hidden="true">size</span>
      <div class="fader-wrap">
        <span class="slot" aria-hidden="true"><span class="fill"></span></span>
        <input class="fader" type="range" id="${id}" min="${LEVEL_DEF.min}" max="${LEVEL_DEF.max}"
               step="${LEVEL_DEF.step}" aria-label="Level ${i + 1} mark size">
      </div>
      <div class="level-foot">
        <label class="channel-name" for="${id}">${i + 1}</label>
        <button type="button" class="level-remove" aria-label="Remove level ${i + 1}">${X_ICON}</button>
      </div>`;

    const lv = () => state.levels[i];
    const tile = strip.querySelector('.mark-tile');
    const colour = strip.querySelector('.colour-chip');
    const grad = strip.querySelector('.grad-toggle');
    const text = strip.querySelector('.readout');
    const range = strip.querySelector('.fader');

    tile.addEventListener('click', () => openMarkMenu(i, tile));
    tile.addEventListener('dragover', (e) => { e.preventDefault(); tile.classList.add('is-drop'); });
    tile.addEventListener('dragleave', () => tile.classList.remove('is-drop'));
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.classList.remove('is-drop');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleUpload(i, file);
    });

    colour.addEventListener('input', () => {
      lv().colour = colour.value;
      lv().useGradient = false;
      refreshLevel(i);
      allGradSwitch.sync();
    });
    grad.addEventListener('click', () => {
      lv().useGradient = !lv().useGradient;
      refreshLevel(i);
      allGradSwitch.sync();
    });

    const setScale = (v) => { lv().scale = v; refreshLevel(i); };
    range.addEventListener('input', () => setScale(clampLevelScale(range.value, lv().scale)));
    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); text.blur(); return; }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !/^[0-9.]$/.test(e.key)) e.preventDefault();
    });
    text.addEventListener('input', () => {
      const clean = sanitise(text.value, true);
      if (clean !== text.value) {
        const pos = Math.max(0, text.selectionStart - (text.value.length - clean.length));
        text.value = clean;
        text.setSelectionRange(pos, pos);
      }
    });
    text.addEventListener('focus', () => text.select());
    text.addEventListener('change', () => {
      const v = text.value.trim();
      setScale(v === '' || v === '.' ? lv().scale : clampLevelScale(v, lv().scale));
    });

    strip.querySelector('.level-remove').addEventListener('click', () => {
      if (state.levels.length <= MIN_LEVELS) return;
      state.levels.splice(i, 1);
      renderLevels();
      announce(`Removed level ${i + 1}`);
      const next = levelChannels.querySelectorAll('.mark-tile')[Math.min(i, state.levels.length - 1)];
      if (next) next.focus();
    });

    return strip;
  }

  function refreshLevel(i) {
    const lv = state.levels[i];
    const strip = levelChannels.children[i];
    if (!lv || !strip) return;
    paintTile(lv, strip.querySelector('canvas'));
    const markLabel = lv.upload ? `uploaded image${lv.keepOriginal ? ', original colours' : ''}` : shapeName(lv.shape);
    strip.querySelector('.mark-tile').setAttribute('aria-label',
      `Level ${i + 1} mark: ${markLabel}. Choose a shape or drop an image.`);
    strip.querySelector('.colour-chip').value = lv.colour;
    strip.querySelector('.grad-toggle').setAttribute('aria-pressed', String(lv.useGradient));
    const cap = lv.useGradient ? state.blobs[0].hex : lv.colour;
    strip.style.setProperty('--cap', cap);
    strip.style.setProperty('--cap-ink', inkFor(cap));
    strip.querySelector('.readout').value = formatSetting(LEVEL_DEF, lv.scale);
    strip.querySelector('.fader').value = lv.scale;
    strip.style.setProperty('--pct', `${((lv.scale - LEVEL_DEF.min) / (LEVEL_DEF.max - LEVEL_DEF.min)) * 100}%`);
    strip.querySelector('.level-remove').hidden = state.levels.length <= MIN_LEVELS;
  }

  function refreshLevels() {
    state.levels.forEach((_, i) => refreshLevel(i));
    allGradSwitch.sync();
  }

  const addLevelBtn = document.createElement('button');
  addLevelBtn.type = 'button';
  addLevelBtn.className = 'level-add';
  addLevelBtn.setAttribute('aria-label', 'Add a level');
  addLevelBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
    stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
  addLevelBtn.addEventListener('click', () => {
    if (state.levels.length >= MAX_LEVELS) return;
    const last = state.levels[state.levels.length - 1];
    state.levels.push(makeLevel({ colour: randomHex(), shape: SHAPES[state.levels.length % SHAPES.length].id }));
    state.levels[state.levels.length - 1].useGradient = last ? last.useGradient : false;
    renderLevels();
    announce(`Added level ${state.levels.length}`);
    if (addLevelBtn.hidden) levelChannels.querySelectorAll('.mark-tile')[state.levels.length - 1].focus();
  });

  function renderLevels() {
    closeMarkMenu(false);
    levelChannels.replaceChildren(...state.levels.map((_, i) => buildLevelStrip(i)), addLevelBtn);
    addLevelBtn.hidden = state.levels.length >= MAX_LEVELS;
    refreshLevels();
    drawAtlas();
    if (dialog.open) applyScale(wantScale);
  }

  onThemeExtra = () => { if (levelChannels.children.length) refreshLevels(); };

  // ----- Uploads -----
  async function handleUpload(i, file) {
    showLevelStatus('Loading image…');
    try {
      const up = await processUpload(file);
      const lv = state.levels[i];
      if (!lv) return;
      lv.upload = up;
      lv.keepOriginal = false;
      drawAtlas();
      refreshLevel(i);
      showLevelStatus(`Level ${i + 1} now uses ${up.name}`);
      announce(`Level ${i + 1} now uses ${up.name}`);
      if (menuLevel === i) openMarkMenu(i, menuAnchor);
    } catch (err) {
      showLevelStatus(err.message);
      announce(err.message);
    }
  }

  // ----- Mark picker popover -----
  const menu = document.getElementById('mark-menu');
  const fileInput = document.getElementById('mark-file');
  let menuLevel = -1;
  let menuAnchor = null;

  function positionMenu() {
    if (!menuAnchor) return;
    const r = menuAnchor.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let x = r.left + r.width / 2 - mw / 2;
    let y = r.bottom + 8;
    if (y + mh > window.innerHeight - MARGIN) y = r.top - mh - 8;
    x = Math.min(Math.max(MARGIN, x), window.innerWidth - mw - MARGIN);
    y = Math.min(Math.max(MARGIN, y), window.innerHeight - mh - MARGIN);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }

  function openMarkMenu(i, anchor) {
    const lv = state.levels[i];
    menuLevel = i;
    menuAnchor = anchor;
    const cs = getComputedStyle(dialog);
    ['--panel', '--panel-ink', '--u'].forEach((v) => menu.style.setProperty(v, cs.getPropertyValue(v)));
    menu.innerHTML = `
      <p class="mark-menu-title" id="mark-menu-title">Level ${i + 1} mark</p>
      <div class="shape-grid">
        ${SHAPES.map((sh) => `
          <button type="button" class="shape-btn" data-shape="${sh.id}" aria-label="${sh.name}"
                  aria-pressed="${!lv.upload && lv.shape === sh.id}" title="${sh.name}">
            <img src="${shapeThumb(sh.id)}" alt="">
          </button>`).join('')}
      </div>
      <div class="menu-actions">
        <button type="button" class="panel-reset is-small" data-act="upload">${lv.upload ? 'Replace image' : 'Upload image'}</button>
        ${lv.upload ? '<button type="button" class="panel-reset is-small" data-act="remove">Remove image</button>' : ''}
      </div>
      <p class="menu-note">${lv.upload
        ? `Using ${escapeHtml(lv.upload.name)}.`
        : 'Or drop an image onto the tile.'} SVG, PNG, JPEG or WebP, up to 10&nbsp;MB.</p>`;
    if (lv.upload) {
      const keep = makeSwitch('Original colours', 'Keep the image’s original colours',
        () => state.levels[i].keepOriginal,
        (v) => { state.levels[i].keepOriginal = v; drawAtlas(); refreshLevel(i); });
      menu.querySelector('.menu-actions').appendChild(keep);
    }
    menu.querySelectorAll('.shape-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const target = state.levels[i];
        target.shape = b.dataset.shape;
        target.upload = null;
        target.keepOriginal = false;
        drawAtlas();
        refreshLevel(i);
        closeMarkMenu(true);
      });
    });
    menu.querySelector('[data-act="upload"]').addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });
    const remove = menu.querySelector('[data-act="remove"]');
    if (remove) remove.addEventListener('click', () => {
      state.levels[i].upload = null;
      state.levels[i].keepOriginal = false;
      drawAtlas();
      refreshLevel(i);
      openMarkMenu(i, anchor);
    });
    menu.hidden = false;
    positionMenu();
    (menu.querySelector('.shape-btn[aria-pressed="true"]') || menu.querySelector('button')).focus();
  }

  function closeMarkMenu(returnFocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    const anchor = menuAnchor;
    menuLevel = -1;
    menuAnchor = null;
    if (returnFocus && anchor && anchor.isConnected) anchor.focus();
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (file && menuLevel >= 0) handleUpload(menuLevel, file);
  });
  document.addEventListener('pointerdown', (e) => {
    if (menu.hidden) return;
    if (menu.contains(e.target) || (menuAnchor && menuAnchor.contains(e.target))) return;
    closeMarkMenu(false);
  }, true);
  window.addEventListener('resize', positionMenu);
  dialog.addEventListener('close', () => closeMarkMenu(false));

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // M toggles mark mode anywhere outside a text box.
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'm' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    e.preventDefault();
    setMarkMode(!CONFIG.markMode);
  });

  renderLevels();
  syncTileBg();
  themePanel(); // tint the new faders too

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  const toUv = (e) => ({
    x: e.clientX / window.innerWidth,
    y: 1 - e.clientY / window.innerHeight,
  });

  function notePointer(e) {
    // Inside the settings panel the gradient switches to idle and ignores the cursor.
    state.overPanel = (dialog.open && dialog.contains(e.target)) ||
      !!(e.target.closest && e.target.closest('.mark-menu'));
    if (state.overPanel) return;
    const uv = toUv(e);
    state.pointer.x = uv.x;
    state.pointer.y = uv.y;
    state.pointer.seen = true;
    state.pointer.last = performance.now();
  }

  window.addEventListener('pointermove', notePointer, { passive: true });

  // A tap or click (little movement) randomises; a drag only steers.
  let down = null;
  canvas.addEventListener('pointerdown', (e) => {
    notePointer(e);
    down = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || down.id !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved < 10) randomise();
  });
  canvas.addEventListener('pointercancel', () => { down = null; });
  dialog.addEventListener('pointerleave', () => { state.overPanel = false; });
  dialog.addEventListener('close', () => { state.overPanel = false; });

  // Keyboard: Space or Enter anywhere outside the buttons also randomises.
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('button, input, dialog, [tabindex], .mark-menu')) {
      e.preventDefault();
      randomise();
    }
  });

  setTimeout(() => {
    if (!state.hasRandomised) hint.classList.add('is-visible');
  }, 700);

  // Public hooks for adding and removing blobs (e.g. from future UI or the console):
  //   grainGradient.addBlob()            -> adds a random colour
  //   grainGradient.addBlob('#00ff88')   -> adds a specific colour
  //   grainGradient.removeBlob()         -> removes the last blob
  //   grainGradient.removeBlob(1)        -> removes the blob at index 1
  window.grainGradient = {
    addBlob,
    removeBlob,
    randomise,
    get blobs() { return state.blobs.map(({ hex, locked }) => ({ hex, locked })); },
    config: CONFIG,
  };

  // ---------------------------------------------------------------------------
  // WebGL
  // ---------------------------------------------------------------------------
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) {
    fallback.hidden = false;
    canvas.hidden = true;
    return;
  }

  const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  // Optional: lets the shader pick a sharpness level for each mark itself,
  // which keeps small marks crisp without shimmering.
  const lodExt = gl.getExtension('EXT_shader_texture_lod');

  const FRAG = `
    ${lodExt ? '#extension GL_EXT_shader_texture_lod : enable' : ''}
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif

    #define MAX_BLOBS ${CONFIG.maxBlobs}
    #define MAX_LEVELS ${MAX_LEVELS}
    #define ATLAS_GRID ${ATLAS_GRID}.0
    #define MARK_FILL ${MARK_FILL}
    #define SLOT_PX ${SLOT}.0
    ${lodExt ? '#define HAS_LOD 1' : ''}

    uniform vec2  uRes;
    uniform float uAspect;
    uniform int   uCount;
    uniform vec4  uBlob[MAX_BLOBS];   // x, y, radius, weight
    uniform vec3  uLab[MAX_BLOBS];
    uniform float uFrame;
    uniform float uGrain;
    uniform float uLevels;
    uniform float uSpread;
    uniform float uSharp;
    uniform float uWobble;
    uniform float uTime;

    // Mark mode
    uniform float uMarkMode;
    uniform float uCell;              // cell size in canvas pixels
    uniform float uHex;
    uniform float uGap;
    uniform float uScatter;
    uniform float uMinS;
    uniform float uMaxS;
    uniform float uDither;
    uniform float uContrast;
    uniform float uBias;
    uniform float uInvert;
    uniform float uPickBlob;
    uniform float uSwitchAmt;
    uniform float uReach;
    uniform float uSwitchStep;
    uniform float uBgGrad;
    uniform vec3  uBg;
    uniform int   uLevelCount;
    uniform vec4  uLevA[MAX_LEVELS];  // r, g, b, use gradient colour
    uniform vec4  uLevB[MAX_LEVELS];  // size scale, keep original colours
    uniform sampler2D uAtlas;

    // Dave Hoskins' hash without sine: stable on mobile GPUs.
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Smooth value noise, used to warp the blob outlines.
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    vec2 warp(vec2 q, float t) {
      vec2 a = vec2(vnoise(q * 1.8 + vec2(t * 0.16, 3.1)),
                    vnoise(q * 1.8 + vec2(7.3, t * 0.14))) - 0.5;
      vec2 b = vec2(vnoise(q * 4.1 + vec2(1.7, t * 0.27)),
                    vnoise(q * 4.1 + vec2(t * 0.23, 9.2))) - 0.5;
      return a + b * 0.45;
    }

    vec3 oklabToLinear(vec3 c) {
      float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
      float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
      float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
      float l = l_ * l_ * l_;
      float m = m_ * m_ * m_;
      float s = s_ * s_ * s_;
      return vec3(
         4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
      );
    }

    vec3 linearToSrgb(vec3 c) {
      c = clamp(c, 0.0, 1.0);
      vec3 lo = c * 12.92;
      vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
      return mix(lo, hi, step(vec3(0.0031308), c));
    }

    vec3 labToSrgb(vec3 lab) { return linearToSrgb(oklabToLinear(lab)); }

    // The blended gradient colour (in OKLab) at a screen position, plus the
    // index of the blob with the most influence there.
    vec3 gradientLab(vec2 uv, out float dominant) {
      vec2 q = vec2(uv.x * uAspect, uv.y);
      if (uWobble > 0.0) q += warp(q, uTime) * uWobble * 0.7;
      vec3 lab = vec3(0.0);
      float total = 0.0;
      float best = -1.0;
      dominant = 0.0;
      for (int i = 0; i < MAX_BLOBS; i++) {
        if (i >= uCount) break;
        vec4 bl = uBlob[i];
        vec2 d = q - vec2(bl.x * uAspect, bl.y);
        float k = dot(d, d) / (bl.z * bl.z);
        float w = bl.w / pow(k + uSpread, uSharp);
        lab += w * uLab[i];
        total += w;
        if (w > best) { best = w; dominant = float(i); }
      }
      return lab / max(total, 1e-6);
    }

    vec4 sampleMark(vec2 auv, float lod) {
      #ifdef HAS_LOD
        return texture2DLodEXT(uAtlas, auv, lod);
      #else
        return texture2D(uAtlas, auv);
      #endif
    }

    vec3 renderMarks() {
      vec2 p = gl_FragCoord.xy;
      float cw = uCell;
      float ch = uHex > 0.5 ? uCell * 0.8660254 : uCell;
      float row = floor(p.y / ch);
      float xoff = (uHex > 0.5 && mod(row, 2.0) > 0.5) ? cw * 0.5 : 0.0;
      float col = floor((p.x - xoff) / cw);
      vec2 cellId = vec2(col, row);
      vec2 centre = vec2((col + 0.5) * cw + xoff, (row + 0.5) * ch);

      float dom;
      vec3 lab = gradientLab(centre / uRes, dom);

      // Brightness of the gradient at this cell, stretched across the levels.
      float t = clamp((lab.x - 0.62) * uContrast + 0.5 + (uBias - 0.5), 0.0, 1.0);
      if (uInvert > 0.5) t = 1.0 - t;

      float n = float(uLevelCount);
      float level;
      if (uPickBlob > 0.5) {
        level = mod(dom, n);
      } else {
        // The grain lives on here: noise nudges cells into neighbouring levels.
        float tj = t + (hash(cellId + 17.0) - 0.5) * uDither * 2.0 / n;
        level = floor(clamp(tj, 0.0, 0.9999) * n);
      }

      // Random switching: some cells swap to a nearby level for a while.
      if (uSwitchAmt > 0.0 && hash(cellId * 1.7 + uSwitchStep * 3.17 + 5.0) < uSwitchAmt) {
        float steps = 1.0 + floor(hash(cellId * 3.1 + uSwitchStep * 0.77 + 2.0) * uReach);
        level += hash(cellId * 2.3 + uSwitchStep * 1.31 + 9.0) < 0.5 ? -steps : steps;
        level = uPickBlob > 0.5 ? mod(level + n * 8.0, n) : clamp(level, 0.0, n - 1.0);
      }

      vec4 la = vec4(1.0);
      vec4 lb = vec4(1.0, 0.0, 0.0, 0.0);
      for (int i = 0; i < MAX_LEVELS; i++) {
        if (float(i) == level) { la = uLevA[i]; lb = uLevB[i]; }
      }

      float size = clamp(mix(uMinS, uMaxS, t) * lb.x, 0.0, 1.0);
      float box = min(cw, ch) * (1.0 - uGap) * size;

      // Scatter only uses the cell's free space, so marks never get clipped.
      vec2 freeSpace = max(vec2(cw, ch) - box, 0.0);
      vec2 jitter = (vec2(hash(cellId + 3.3), hash(cellId + 7.7)) - 0.5) * freeSpace * uScatter;
      vec2 c = centre + jitter;

      float unused;
      vec3 bg = uBgGrad > 0.5 ? labToSrgb(gradientLab(p / uRes, unused)) : uBg;
      if (box < 0.5) return bg;

      float boxFull = box / MARK_FILL;
      vec2 suv = (p - c) / boxFull + 0.5;
      if (suv.x < 0.0 || suv.y < 0.0 || suv.x > 1.0 || suv.y > 1.0) return bg;

      vec2 slot = vec2(mod(level, ATLAS_GRID), floor(level / ATLAS_GRID));
      vec2 auv = (slot + vec2(suv.x, 1.0 - suv.y)) / ATLAS_GRID;
      float lod = max(0.0, log2(SLOT_PX / boxFull));
      vec4 tex = sampleMark(auv, lod);

      vec3 markCol = la.w > 0.5 ? labToSrgb(lab) : la.rgb;
      vec3 premul = lb.y > 0.5 ? tex.rgb : markCol * tex.a;
      return bg * (1.0 - tex.a) + premul;
    }

    void main() {
      if (uMarkMode > 0.5) {
        gl_FragColor = vec4(clamp(renderMarks(), 0.0, 1.0), 1.0);
        return;
      }

      float unused;
      vec3 col = labToSrgb(gradientLab(gl_FragCoord.xy / uRes, unused));

      // Coarse noise grain, then quantise with random thresholds.
      // The random threshold keeps the average colour true while
      // breaking smooth bands into speckled, lo-fi steps.
      vec2 cell = floor(gl_FragCoord.xy);
      float n  = hash(cell + vec2(uFrame * 13.1, uFrame * 7.7));
      float n2 = hash(cell * 1.37 + vec2(uFrame * 3.3, uFrame * 11.9) + 19.0);
      col += (n - 0.5) * uGrain;
      col = floor(col * uLevels + n2) / uLevels;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.error(err);
    fallback.hidden = false;
    canvas.hidden = true;
    return;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ['uRes', 'uAspect', 'uCount', 'uBlob[0]', 'uLab[0]', 'uFrame', 'uGrain', 'uLevels', 'uSpread', 'uSharp',
    'uWobble', 'uTime', 'uMarkMode', 'uCell', 'uHex', 'uGap', 'uScatter', 'uMinS', 'uMaxS', 'uDither',
    'uContrast', 'uBias', 'uInvert', 'uPickBlob', 'uSwitchAmt', 'uReach', 'uSwitchStep', 'uBgGrad', 'uBg',
    'uLevelCount', 'uLevA[0]', 'uLevB[0]', 'uAtlas']
    .forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

  const blobArr = new Float32Array(CONFIG.maxBlobs * 4);
  const labArr = new Float32Array(CONFIG.maxBlobs * 3);
  const levA = new Float32Array(MAX_LEVELS * 4);
  const levB = new Float32Array(MAX_LEVELS * 4);

  // The mark atlas texture, re-uploaded whenever a level's mark changes.
  const atlasTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, lodExt ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.uniform1i(u.uAtlas, 0);

  function uploadAtlas() {
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    if (lodExt) gl.generateMipmap(gl.TEXTURE_2D);
    atlasDirty = false;
  }

  // Grain mode draws at a fraction of the screen's resolution (one canvas
  // pixel per grain); mark mode draws at near-full sharpness (capped at 1.5x to stay smooth on phones).
  const markPixelRatio = () => Math.min(1.5, window.devicePixelRatio || 1);
  function resize() {
    const per = CONFIG.markMode ? 1 / markPixelRatio() : CONFIG.grainPx;
    const w = Math.max(1, Math.ceil(window.innerWidth / per));
    const h = Math.max(1, Math.ceil(window.innerHeight / per));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  window.addEventListener('resize', resize);
  resizeCanvas = resize;
  resize();

  // ---------------------------------------------------------------------------
  // Motion
  // ---------------------------------------------------------------------------
  const ease = (rate, dt) => 1 - Math.exp(-rate * dt);

  // Slow, looping drift path used when the cursor is idle.
  // ----- Smooth 1D noise -----
  // Random values at whole numbers, eased between them. Returns -1..1.
  function hash1(i, seed) {
    const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return (v - Math.floor(v)) * 2 - 1;
  }
  function noise1(t, seed) {
    const i = Math.floor(t);
    const f = t - i;
    const u = f * f * f * (f * (f * 6 - 15) + 10);
    return hash1(i, seed) + (hash1(i + 1, seed) - hash1(i, seed)) * u;
  }
  // Layered noise: big slow swings with smaller, quicker detail on top.
  function fbm(t, seed) {
    return (noise1(t, seed) + 0.5 * noise1(t * 2.03, seed + 17) + 0.25 * noise1(t * 4.01, seed + 41)) / 1.75;
  }

  const PATH_SEED = Math.random() * 1000;

  // The point the main blob chases when idle. Randomness blends from a
  // smooth repeating loop (0) to a meandering noise path that never repeats (1).
  function wander(s) {
    const loopX = 0.5 + 0.3 * Math.sin(s * 0.21) + 0.08 * Math.sin(s * 0.53 + 1.3);
    const loopY = 0.5 + 0.26 * Math.sin(s * 0.17 + 0.7) + 0.07 * Math.cos(s * 0.47);
    // Two smooth layers of noise per axis; tanh keeps the path on screen
    // while letting it reach close to the edges.
    const n = (t, seed) => (noise1(t, seed) + 0.35 * noise1(t * 2.1, seed + 17)) / 1.35;
    const noiseX = 0.5 + 0.44 * Math.tanh(1.9 * n(s * 0.1, PATH_SEED));
    const noiseY = 0.5 + 0.42 * Math.tanh(1.9 * n(s * 0.1, PATH_SEED + 500));
    // Blend the offsets from centre, then rescale so mixing the two paths
    // doesn't shrink the drift toward the middle.
    const r = CONFIG.randomness;
    const keep = 1 / Math.hypot(1 - r, r);
    const mix = (a, b) => 0.5 + ((a - 0.5) * (1 - r) + (b - 0.5) * r) * keep;
    return {
      x: Math.min(0.95, Math.max(0.05, mix(loopX, noiseX))),
      y: Math.min(0.95, Math.max(0.05, mix(loopY, noiseY))),
    };
  }

  let lastT = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const motion = reducedMotion ? 0.15 : 1;
    state.simTime += dt * motion;
    const s = state.simTime;

    state.wanderTime += dt * motion * CONFIG.idleSpeed;
    const idle = state.forceIdle || state.overPanel || !state.pointer.seen ||
      now - state.pointer.last > CONFIG.idleDelay;
    const target = idle ? wander(state.wanderTime) : state.pointer;
    const k = ease(idle ? CONFIG.idleEase * motion : CONFIG.followEase, dt);
    state.anchor.x += (target.x - state.anchor.x) * k;
    state.anchor.y += (target.y - state.anchor.y) * k;

    const aspect = window.innerWidth / window.innerHeight;
    // Orbits are sized to the screen's shorter side, so on a tall phone they
    // don't swing across the whole width.
    const orbitScale = Math.min(1, aspect);
    const rnd = CONFIG.randomness;
    const trail = ease(CONFIG.trailEase * (reducedMotion ? 0.5 : 1), dt);

    state.blobs.forEach((b, i) => {
      if (i === 0) {
        const pk = ease(12, dt);
        b.x += (state.anchor.x - b.x) * pk;
        b.y += (state.anchor.y - b.y) * pk;
      } else {
        // With randomness, each blob's orbit speed wanders (sometimes stalling
        // or briefly reversing), its distance breathes in and out, and it
        // drifts slightly off the circle.
        const nt = s * 0.17 + b.seed;
        const speedJitter = 1 + rnd * 1.5 * fbm(nt, b.seed);
        b.theta += dt * motion * b.speed * speedJitter * (idle ? 1.6 * CONFIG.idleSpeed : 1) * Math.PI * 2 * 0.35;
        const breathe = (1 - rnd) * 0.28 * Math.sin(s * 0.31 + b.phase) + rnd * 0.55 * fbm(nt * 1.3, b.seed + 7);
        const r = b.orbit * (1 + breathe) * orbitScale;
        const jx = rnd * 0.09 * fbm(nt * 1.7, b.seed + 13) * orbitScale;
        const jy = rnd * 0.09 * fbm(nt * 1.7, b.seed + 29) * orbitScale;
        const tx = state.anchor.x + (Math.cos(b.theta) * r + jx) / aspect;
        const ty = state.anchor.y + Math.sin(b.theta) * r + jy;
        b.x += (tx - b.x) * trail;
        b.y += (ty - b.y) * trail;
      }
      blobArr[i * 4] = b.x;
      blobArr[i * 4 + 1] = b.y;
      blobArr[i * 4 + 2] = i === 0 ? 0.3 : b.radius;
      blobArr[i * 4 + 3] = i === 0 ? 1.5 : 1;
      labArr.set(b.lab, i * 3);
    });

    const grainFrame = reducedMotion || CONFIG.grainFps <= 0
      ? 0
      : Math.floor((now / 1000) * CONFIG.grainFps) % 97;

    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uAspect, aspect);
    gl.uniform1i(u.uCount, state.blobs.length);
    gl.uniform4fv(u['uBlob[0]'], blobArr);
    gl.uniform3fv(u['uLab[0]'], labArr);
    gl.uniform1f(u.uFrame, grainFrame);
    gl.uniform1f(u.uGrain, CONFIG.grainAmount);
    gl.uniform1f(u.uLevels, CONFIG.levels);
    gl.uniform1f(u.uSpread, CONFIG.spread);
    gl.uniform1f(u.uSharp, 4 - CONFIG.softness * 3.4); // softness 0..1 -> falloff 4..0.6
    gl.uniform1f(u.uWobble, CONFIG.wobble);
    gl.uniform1f(u.uTime, state.simTime % 3600);

    gl.uniform1f(u.uMarkMode, CONFIG.markMode ? 1 : 0);
    if (CONFIG.markMode) {
      if (atlasDirty) uploadAtlas();
      state.levels.forEach((lv, i) => {
        const rgb = hexToRgb(lv.colour);
        levA.set([rgb[0], rgb[1], rgb[2], lv.useGradient ? 1 : 0], i * 4);
        levB.set([lv.scale, lv.upload && lv.keepOriginal ? 1 : 0, 0, 0], i * 4);
      });
      const hold = Math.max(0.1, CONFIG.markHold) * (reducedMotion ? 4 : 1);
      gl.uniform1f(u.uCell, CONFIG.markCell * markPixelRatio());
      gl.uniform1f(u.uHex, CONFIG.markHex ? 1 : 0);
      gl.uniform1f(u.uGap, CONFIG.markGap);
      gl.uniform1f(u.uScatter, CONFIG.markScatter);
      gl.uniform1f(u.uMinS, CONFIG.markMin);
      gl.uniform1f(u.uMaxS, CONFIG.markMax);
      gl.uniform1f(u.uDither, CONFIG.markDither);
      gl.uniform1f(u.uContrast, CONFIG.markContrast);
      gl.uniform1f(u.uBias, CONFIG.markBias);
      gl.uniform1f(u.uInvert, CONFIG.markInvert ? 1 : 0);
      gl.uniform1f(u.uPickBlob, CONFIG.markPick === 'blob' ? 1 : 0);
      gl.uniform1f(u.uSwitchAmt, CONFIG.markSwitch);
      gl.uniform1f(u.uReach, CONFIG.markReach);
      gl.uniform1f(u.uSwitchStep, Math.floor(now / 1000 / hold) % 997);
      gl.uniform1f(u.uBgGrad, CONFIG.markBgGradient ? 1 : 0);
      gl.uniform3fv(u.uBg, hexToRgb(CONFIG.markBg));
      gl.uniform1i(u.uLevelCount, state.levels.length);
      gl.uniform4fv(u['uLevA[0]'], levA);
      gl.uniform4fv(u['uLevB[0]'], levB);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
