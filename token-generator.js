// ─── COLOR UTILS ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(r * 255, g * 255, b * 255);
}
function lighten(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * pct, g + (255 - g) * pct, b + (255 - b) * pct);
}
function darken(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - pct), g * (1 - pct), b * (1 - pct));
}
function shiftHue(hex, deg) {
  const { r, g, b } = hexToRgb(hex);
  let { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex((h + deg + 360) % 360, Math.max(s, 40), Math.min(Math.max(l, 35), 55));
}
function hexWithAlpha(hex, a) {
  const ai = Math.round(a * 255);
  return hex.replace('#', '') + ai.toString(16).padStart(2, '0');
}
function toRgbaStr(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
function contrastText(hex) {
  return getLuminance(hex) > 0.35 ? '#17181D' : '#FFFFFF';
}

// ─── GENERATE ───────────────────────────────────────────────────────────────
let STATE = { tokens: {}, brandHex: '#13D16A', neutralHex: '#17181D' };

function buildTokens(brandHex, neutralHex) {
  const B = brandHex, N = neutralHex;
  const l = lighten, d = darken;

  // brand scale stops
  const b100 = d(B, .55);
  const b200 = d(B, .22);
  const b300 = l(B, .08);
  const b400 = B;
  const b500 = l(B, .60);
  const b600 = l(B, .80);

  // neutral stops
  const n200 = l(N, .92);
  const n300 = l(N, .78);
  const n400 = l(N, .55);
  const n500 = l(N, .28);
  const n600 = l(N, .10);

  // brand HSL — використовуємо S і L для адаптації additional і states
  const { r: br, g: bg2, b: bb } = hexToRgb(B);
  const { s: brandS, l: brandLum } = rgbToHsl(br, bg2, bb);
  // адаптуємо: берем hue оригіналу, S і L = середнє між оригінальним і brand
  function adaptColor(origHex) {
    const { r: or, g: og, b: ob } = hexToRgb(origHex);
    const { h: origH, s: origS, l: origL } = rgbToHsl(or, og, ob);
    const s = (origS + brandS) / 2;
    const lv = (origL + brandLum) / 2;
    return hslToHex(origH, s, lv);
  }

  // additional palette — фіксований hue, адаптований S/L
  const paris     = adaptColor('#FF4081');
  const newYork   = adaptColor('#FFC422');
  const tokyo     = adaptColor('#FF9A43');
  const sydney    = adaptColor('#9D7CE5');
  const capeTown  = adaptColor('#CC73EF');
  const dubai     = adaptColor('#13D1C2');
  const barcelona = adaptColor('#13A2D1');

  // states — фіксований hue, адаптований S/L
  const stateSuccess = adaptColor('#13D16A');
  const stateWarning = adaptColor('#FFCC00');
  const stateError   = adaptColor('#FF3B30');

  return {
    // base dark
    '--base-dark-100': N,
    '--base-dark-200': n500,
    '--base-dark-300': n400,
    '--base-dark-400': n300,
    '--base-light-100': '#FFFFFF',
    '--base-light-100-gradient': '#FFFFFF00',
    '--base-brand-primary': B,

    // brand scale
    '--base-brand-100': b100,
    '--base-brand-200': b200,
    '--base-brand-300': b300,
    '--base-brand-400': b500,
    '--base-brand-500': b600,
    '--base-brand-600': l(B, .88),

    // text
    '--text-primary': N,
    '--text-secondary': n500,
    '--text-tertiary': n400,
    '--text-inverted': '#FFFFFF',
    '--text-helper': n300,
    '--text-accent': B,
    '--text-link-default': d(B, .28),
    '--text-link-hover': d(B, .12),
    '--text-link-pressed': d(B, .40),

    // surfaces
    '--surface-primary-background': l(N, .97),
    '--surface-primary-background-gradient-off': l(N, .97) + '00',
    '--surface-elevation': '#FFFFFF',
    '--surface-down-bg': l(N, .90),
    '--surface-selected': l(B, .82),
    '--surface-disabled': '#00000007',
    '--surface-disabled-light': '#FFFFFF21',
    '--surface-overlay': '#00000033',
    '--surface-inv-background': l(N, .20),

    // borders
    '--border-div-border': l(N, .94),
    '--border-border-for-bg': l(N, .88),

    // buttons
    '--button-text-primary-default': '#FFFFFF',
    '--button-text-secondary-default': N,
    '--button-text-disabled': n300,
    '--button-border-secondary': '#' + hexWithAlpha(B, 0.31),
    '--button-border-tertiary': '#B2B2B24F',
    '--button-fill-primary-start': l(B, .12),
    '--button-fill-primary-end': B,
    '--button-fill-secondary': '#FFFFFF',
    '--button-fill-disable': '#00000007',
    '--button-fill-player': '#0000003D',
    '--button-fill-danger-start': '#F99494',
    '--button-fill-danger-end': '#FF5858',
    '--button-shadow-first': '#' + hexWithAlpha(B, 0.26),
    '--button-shadow-second': '#' + hexWithAlpha(B, 0.16),

    // states — hue фіксований, S/L адаптовані під brand
    '--states-success':            stateSuccess,
    '--states-success-background': lighten(stateSuccess, .88),
    '--states-success-gradient':   lighten(stateSuccess, .95),
    '--states-warning':            stateWarning,
    '--states-warning-background': lighten(stateWarning, .88),
    '--states-error':              stateError,
    '--states-error-background':   lighten(stateError, .90),
    '--states-error-gradient':     lighten(stateError, .95),
    '--states-info-background': '#E6F4FF',
    '--states-inactive-background': l(N, .95),
    '--states-inactive-background-hover': l(N, .90),

    // icons
    '--icons-color-primary': B,
    '--icons-color-inverted': '#FFFFFF',

    // additional — fixed original colors
    '--additional-paris':          paris,
    '--additional-paris-bg':       '#' + hexWithAlpha(paris,     0.06),
    '--additional-new-york':       newYork,
    '--additional-new-york-bg':    '#' + hexWithAlpha(newYork,   0.13),
    '--additional-tokyo':          tokyo,
    '--additional-tokyo-bg':       '#' + hexWithAlpha(tokyo,     0.06),
    '--additional-sydney':         sydney,
    '--additional-sydney-bg':      '#' + hexWithAlpha(sydney,    0.06),
    '--additional-cape-town':      capeTown,
    '--additional-cape-town-bg':   '#' + hexWithAlpha(capeTown,  0.06),
    '--additional-dubai':          dubai,
    '--additional-dubai-bg':       '#' + hexWithAlpha(dubai,     0.06),
    '--additional-barcelona':      barcelona,
    '--additional-barcelona-bg':   '#' + hexWithAlpha(barcelona, 0.06),
  };
}

function generate() {
  const brandHex = document.getElementById('hex-brand').value.trim();
  const neutralHex = document.getElementById('hex-neutral').value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(brandHex) || !/^#[0-9a-fA-F]{6}$/.test(neutralHex)) {
    toast('Invalid HEX format'); return;
  }
  STATE.brandHex = brandHex;
  STATE.neutralHex = neutralHex;
  STATE.tokens = buildTokens(brandHex, neutralHex);

  document.documentElement.style.setProperty('--c-brand', brandHex);

  renderVisual();
  renderPreview();
  renderCSS();
  renderJSON();
  renderFigmaScript();
}

// ─── RENDER VISUAL ──────────────────────────────────────────────────────────
function makeSwatch(name, val, container) {
  const el = document.createElement('div');
  el.className = 'token-row';
  el.title = `Click to copy ${val}`;
  el.onclick = () => copyText(val);
  el.innerHTML = `
    <div class="token-swatch" style="background:${val}"></div>
    <div class="token-info">
      <div class="token-name">${name}</div>
      <div class="token-val">${val}</div>
    </div>
    <span class="token-copy-icon">⎘</span>`;
  container.appendChild(el);
}

function makeScaleChip(label, val, bar) {
  const chip = document.createElement('div');
  chip.className = 'scale-chip';
  chip.innerHTML = `
    <div class="scale-chip-swatch" style="background:${val}" title="${label}: ${val}" onclick="copyText('${val}')"></div>
    <div class="scale-chip-label">${label}</div>`;
  bar.appendChild(chip);
}

function renderVisual() {
  const B = STATE.brandHex, N = STATE.neutralHex;
  const l = lighten, d = darken;
  const T = STATE.tokens;

  // brand scale
  const bs = document.getElementById('brand-scale'); bs.innerHTML = '';
  [[100,d(B,.55)],[200,d(B,.22)],[300,d(B,.08)],[400,B],[500,l(B,.35)],[600,l(B,.60)],[700,l(B,.80)],[800,l(B,.90)]]
    .forEach(([k,v]) => makeScaleChip(k, v, bs));

  // neutral scale
  const ns = document.getElementById('neutral-scale'); ns.innerHTML = '';
  [[100,N],[200,l(N,.10)],[300,l(N,.28)],[400,l(N,.55)],[500,l(N,.78)],[600,l(N,.92)],[700,'#FFFFFF']]
    .forEach(([k,v]) => makeScaleChip(k, v, ns));

  // additional
  const as_ = document.getElementById('additional-scale'); as_.innerHTML = '';
  const addKeys = ['--additional-paris','--additional-new-york','--additional-tokyo',
    '--additional-sydney','--additional-cape-town','--additional-dubai','--additional-barcelona'];
  const addLabels = ['paris','new-york','tokyo','sydney','cape-town','dubai','barcelona'];
  addKeys.forEach((k, i) => makeScaleChip(addLabels[i], T[k], as_));
  const surfKeys = ['--surface-primary-background','--surface-elevation','--surface-down-bg','--surface-selected','--surface-overlay','--surface-inv-background','--border-div-border','--border-border-for-bg'];
  const textKeys = ['--text-primary','--text-secondary','--text-tertiary','--text-helper','--text-accent','--text-inverted','--text-link-default','--text-link-hover','--text-link-pressed'];
  const stateKeys = ['--states-success','--states-success-background','--states-warning','--states-warning-background','--states-error','--states-error-background','--states-info-background','--states-inactive-background'];
  const btnKeys = ['--button-fill-primary-start','--button-fill-primary-end','--button-fill-secondary','--button-text-primary-default','--button-text-secondary-default','--button-text-disabled','--button-fill-danger-start','--button-fill-danger-end','--button-shadow-first','--button-shadow-second'];
  const borderKeys = ['--border-div-border','--border-border-for-bg'];

  const containers = {
    'surface-tokens': surfKeys,
    'text-tokens': textKeys,
    'state-tokens': stateKeys,
    'button-tokens': btnKeys,
    'border-tokens': borderKeys,
  };

  Object.entries(containers).forEach(([id, keys]) => {
    const el = document.getElementById(id); el.innerHTML = '';
    keys.forEach(k => { if (T[k]) makeSwatch(k, T[k], el); });
  });
}

// ─── RENDER PREVIEW ─────────────────────────────────────────────────────────
function renderPreview() {
  const T = STATE.tokens;
  const B = STATE.brandHex;
  const N = STATE.neutralHex;
  const container = document.getElementById('preview-cards');
  container.innerHTML = '';

  // Buttons preview
  const btnCard = document.createElement('div');
  btnCard.className = 'preview-card';
  btnCard.innerHTML = `
    <div class="preview-card-header">
      <div class="preview-card-title">Buttons</div>
      <div class="btn-preview-row">
        <button class="btn-sample" style="background:${B};color:#fff;border:none">Primary</button>
        <button class="btn-sample" style="background:#fff;color:${N};border:1px solid ${lighten(N,.70)}">Secondary</button>
        <button class="btn-sample" style="background:#FF5858;color:#fff;border:none">Danger</button>
        <button class="btn-sample" style="background:${lighten(N,.92)};color:${lighten(N,.55)};border:none">Disabled</button>
      </div>
    </div>`;
  container.appendChild(btnCard);

  // Typography
  const typCard = document.createElement('div');
  typCard.className = 'preview-card';
  typCard.innerHTML = `
    <div class="preview-card-header">
      <div class="preview-card-title">Typography</div>
    </div>
    <div class="preview-card-body">
      <div class="text-sample" style="color:${N};font-weight:600">Text Primary</div>
      <div class="text-sample" style="color:${lighten(N,.28)}">Text Secondary</div>
      <div class="text-sample" style="color:${lighten(N,.55)}">Text Tertiary</div>
      <div class="text-sample" style="color:${B}">Text Accent</div>
      <div class="text-sample" style="color:${darken(B,.28)};text-decoration:underline">Link Default</div>
    </div>`;
  container.appendChild(typCard);

  // Badges/States
  const badgeCard = document.createElement('div');
  badgeCard.className = 'preview-card';
  badgeCard.innerHTML = `
    <div class="preview-card-header">
      <div class="preview-card-title">States & Badges</div>
    </div>
    <div class="preview-card-body">
      <div>
        <span class="preview-badge" style="background:${T['--states-success-background']};color:${darken(T['--states-success'],.35)}">Success</span>
        <span class="preview-badge" style="background:${T['--states-warning-background']};color:${darken(T['--states-warning'],.40)}">Warning</span>
        <span class="preview-badge" style="background:${T['--states-error-background']};color:${darken(T['--states-error'],.35)}">Error</span>
        <span class="preview-badge" style="background:#E6F4FF;color:#1565A0">Info</span>
      </div>
    </div>`;
  container.appendChild(badgeCard);

  // Surfaces
  const surfCard = document.createElement('div');
  surfCard.className = 'preview-card';
  surfCard.style.overflow = 'hidden';
  surfCard.innerHTML = `
    <div class="preview-card-header">
      <div class="preview-card-title">Surfaces</div>
    </div>
    <div class="preview-card-body" style="padding:0">
      <div style="padding:10px 14px;background:${lighten(N,.97)};font-size:12px;color:${N}">surface-primary-background</div>
      <div style="padding:10px 14px;background:#fff;font-size:12px;color:${N}">surface-elevation</div>
      <div style="padding:10px 14px;background:${lighten(B,.82)};font-size:12px;color:${darken(B,.45)}">surface-selected</div>
      <div style="padding:10px 14px;background:${lighten(N,.90)};font-size:12px;color:${N}">surface-down-bg</div>
    </div>`;
  container.appendChild(surfCard);

  // Additional palette
  const addPairs = [
    ['paris','--additional-paris'],['new-york','--additional-new-york'],
    ['tokyo','--additional-tokyo'],['sydney','--additional-sydney'],
    ['cape-town','--additional-cape-town'],['dubai','--additional-dubai'],
    ['barcelona','--additional-barcelona']
  ];
  const addCard = document.createElement('div');
  addCard.className = 'preview-card';
  addCard.style.gridColumn = '1 / -1';
  const chips = addPairs.map(([name, key]) => {
    const c = T[key];
    return `<span class="preview-badge" style="background:${c}1a;color:${c}">${name}</span>`;
  }).join('');
  addCard.innerHTML = `
    <div class="preview-card-header">
      <div class="preview-card-title">Additional palette</div>
    </div>
    <div class="preview-card-body">${chips}</div>`;
  container.appendChild(addCard);
}

// ─── RENDER CSS ─────────────────────────────────────────────────────────────
function renderCSS() {
  const lines = Object.entries(STATE.tokens).map(([k,v]) => `  ${k}: ${v};`).join('\n');
  const raw = `:root {\n${lines}\n}`;
  STATE.cssRaw = raw;
  const highlighted = raw
    .replace(':root', '<span class="css-kw">:root</span>')
    .replace(/--[\w-]+(?=\s*:)/g, m => `<span class="css-prop">${m}</span>`)
    .replace(/(?<=:\s)[^;]+(?=;)/g, m => `<span class="css-val">${m}</span>`)
    .replace(/[{};]/g, m => `<span class="css-punct">${m}</span>`);
  document.getElementById('css-out').innerHTML = highlighted;
}

// ─── RENDER JSON ─────────────────────────────────────────────────────────────
// Convert 8-char hex (#RRGGBBAA) → rgba() for design-token tool compatibility
function tokenValueForJSON(v) {
  if (!v || v.startsWith('rgba')) return v;
  const hex = v.replace('#', '');
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseFloat((parseInt(hex.slice(6, 8), 16) / 255).toFixed(3));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return v;
}

function renderJSON() {
  const obj = {};
  Object.entries(STATE.tokens).forEach(([k, v]) => {
    const name = k.replace(/^--/, '');
    obj[name] = { value: tokenValueForJSON(v), type: 'color' };
  });
  STATE.jsonRaw = JSON.stringify(obj, null, 2);
  document.getElementById('json-out').textContent = STATE.jsonRaw;
}

// ─── TABS ────────────────────────────────────────────────────────────────────
function showTab(name, btn) {
  ['visual','preview','css','json'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === name ? '' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ─── COPY / DOWNLOAD ─────────────────────────────────────────────────────────
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('Copied!'));
}

function copyCurrentTab() {
  const active = document.querySelector('.tab-btn.active').textContent.trim().toLowerCase();
  if (active === 'css') copyCSSOutput();
  else if (active === 'json') copyJSONOutput();
  else {
    const all = Object.entries(STATE.tokens).map(([k,v]) => `${k}: ${v}`).join('\n');
    copyText(all);
  }
}

function copyCSSOutput()  { copyText(STATE.cssRaw  || ''); }
function copyJSONOutput() { copyText(STATE.jsonRaw || ''); }

function downloadCSS() {
  if (!STATE.cssRaw) return;
  download('tokens.css', STATE.cssRaw, 'text/css');
}

function downloadJSON() {
  if (!STATE.jsonRaw) return;
  download('tokens.json', STATE.jsonRaw, 'application/json');
}

function download(filename, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1600);
}

// ─── FIGMA SCRIPTER ──────────────────────────────────────────────────────────
const TOKEN_GROUPS = [
  ['base-brand',   'base/brand'],
  ['base-dark',    'base/dark'],
  ['base-light',   'base/light'],
  ['text-link',    'text/link'],
  ['text',         'text'],
  ['surface',      'surface'],
  ['border',       'border'],
  ['button-text',  'button/text'],
  ['button-border','button/border'],
  ['button-fill',  'button/fill'],
  ['button-shadow','button/shadow'],
  ['button',       'button'],
  ['states',       'states'],
  ['icons',        'icons'],
  ['additional',   'additional'],
];

function tokenToFigmaName(cssName) {
  const name = cssName.replace(/^--/, '');
  for (const [prefix, group] of TOKEN_GROUPS) {
    if (name === prefix || name.startsWith(prefix + '-')) {
      const rest = name.slice(prefix.length).replace(/^-/, '');
      return rest ? `${group}/${rest}` : group;
    }
  }
  return name;
}

function parseFigmaColor(v) {
  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = v.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
  if (rgbaMatch) {
    return {
      r: (parseInt(rgbaMatch[1]) / 255).toFixed(4),
      g: (parseInt(rgbaMatch[2]) / 255).toFixed(4),
      b: (parseInt(rgbaMatch[3]) / 255).toFixed(4),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]).toFixed(4) : '1.0000',
    };
  }
  // #RRGGBBAA or #RRGGBB or #RGB
  let hex = v.replace('#', '');
  let a = 1;
  if (hex.length === 8) { a = parseInt(hex.slice(6, 8), 16) / 255; hex = hex.slice(0, 6); }
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return null;
  return {
    r: (parseInt(hex.slice(0, 2), 16) / 255).toFixed(4),
    g: (parseInt(hex.slice(2, 4), 16) / 255).toFixed(4),
    b: (parseInt(hex.slice(4, 6), 16) / 255).toFixed(4),
    a: a.toFixed(4),
  };
}

function buildFigmaScript(tokens) {
  const entries = Object.entries(tokens);
  const tokenLines = entries.map(([k, v]) => {
    const figmaName = tokenToFigmaName(k);
    const color = parseFigmaColor(v);
    if (!color) return `  // skipped: ${k} = ${v}`;
    return `  setVar(col, "${figmaName}", {r:${color.r},g:${color.g},b:${color.b},a:${color.a}});`;
  }).join('\n');

  return `// Figma Scripter · Variables API
// Plugin: Scripter (figma.com/community/plugin/1014127678655895)
// Paste this code into Scripter and run it

async function main() {
  let col = figma.variables
    .getLocalVariableCollections()
    .find(c => c.name === "Design Tokens");

  if (!col) {
    col = figma.variables.createVariableCollection("Design Tokens");
  }

  const modeId = col.modes[0].modeId;

  function setVar(col, name, color) {
    let v = figma.variables.getLocalVariables("COLOR")
      .find(x => x.name === name && x.variableCollectionId === col.id);
    if (!v) {
      v = figma.variables.createVariable(name, col, "COLOR");
    }
    v.setValueForMode(modeId, color);
  }

${tokenLines}

  await figma.closePlugin("Done! ${entries.length} variables created.");
}

main().catch(e => { figma.closePlugin("Error: " + e.message); });`;
}

function renderFigmaScript() {
  STATE.figmaScript = buildFigmaScript(STATE.tokens);
}

function copyFigmaScript() {
  if (!STATE.figmaScript) {
    STATE.figmaScript = buildFigmaScript(STATE.tokens);
  }
  const text = STATE.figmaScript;
  if (!text) { toast('Generate tokens first'); return; }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => toast('Script copied!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    toast('Script copied!');
  } catch(e) {
    toast('Copy failed');
  }
  document.body.removeChild(ta);
}

// ─── WCAG AA HELPERS ─────────────────────────────────────────────────────────
function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Brand: must contrast against white (#fff) — it's used as button bg & accent on light surfaces
// Neutral: must contrast against white — it's used as text on light bg
const WCAG_AA = 4.5;
const BRAND_BACKGROUND = '#FFFFFF';
const NEUTRAL_BACKGROUND = '#FFFFFF';

function adjustToWCAG(hex, bg, minRatio) {
  let ratio = contrastRatio(hex, bg);
  if (ratio >= minRatio) return { hex, corrected: false, ratio };

  // Determine if we need to darken or lighten
  const lumBg = getRelativeLuminance(bg);
  const lumColor = getRelativeLuminance(hex);
  const shouldDarken = lumBg > 0.5; // light bg → darken the color

  const { r, g, b } = hexToRgb(hex);
  let { h, s, l } = rgbToHsl(r, g, b);

  // Binary search on lightness
  let lo = 0, hi = l, best = hex;
  if (!shouldDarken) { lo = l; hi = 100; }

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = hslToHex(h, s, mid);
    const r2 = contrastRatio(candidate, bg);
    if (r2 >= minRatio) {
      best = candidate;
      if (shouldDarken) lo = mid; else hi = mid;
    } else {
      if (shouldDarken) hi = mid; else lo = mid;
    }
  }
  const finalRatio = contrastRatio(best, bg);
  return { hex: best, corrected: best.toLowerCase() !== hex.toLowerCase(), ratio: finalRatio };
}

function updateA11yBadge(barId, hex, bg, originalHex) {
  const bar = document.getElementById(barId);
  const result = adjustToWCAG(hex, bg, WCAG_AA);
  const pass = result.ratio >= WCAG_AA;
  const ratio = result.ratio.toFixed(2);
  bar.innerHTML = `
    <span class="a11y-pill ${pass ? 'pass' : 'fail'}">
      ${pass ? '✓' : '✗'} WCAG AA
    </span>
    <span class="a11y-ratio">${ratio}:1</span>
    ${result.corrected ? `<span class="a11y-corrected">→ ${result.hex}</span>` : ''}`;
  return result;
}

// ─── SYNC PICKERS ────────────────────────────────────────────────────────────
function applyColor(cpId, hexId, previewId, a11yBarId, bg) {
  const cp = document.getElementById(cpId);
  const hx = document.getElementById(hexId);
  const pv = document.getElementById(previewId);

  const raw = hx.value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(raw)) return;

  const result = adjustToWCAG(raw, bg, WCAG_AA);

  // If corrected — update UI to show corrected value
  if (result.corrected) {
    hx.value = result.hex;
    cp.value = result.hex;
  }
  pv.style.background = result.hex;
  updateA11yBadge(a11yBarId, result.hex, bg, raw);
  generate();
}

function syncPicker(cpId, hexId, previewId, a11yBarId, bg) {
  const cp = document.getElementById(cpId);
  const hx = document.getElementById(hexId);
  const pv = document.getElementById(previewId);
  cp.addEventListener('input', () => {
    hx.value = cp.value;
    applyColor(cpId, hexId, previewId, a11yBarId, bg);
  });
  hx.addEventListener('input', () => {
    const v = hx.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      cp.value = v;
      applyColor(cpId, hexId, previewId, a11yBarId, bg);
    }
  });
}

syncPicker('cp-brand',   'hex-brand',   'preview-brand',   'a11y-brand',   BRAND_BACKGROUND);
syncPicker('cp-neutral', 'hex-neutral', 'preview-neutral', 'a11y-neutral', NEUTRAL_BACKGROUND);

// init
generate();
updateA11yBadge('a11y-brand',   document.getElementById('hex-brand').value,   BRAND_BACKGROUND);
updateA11yBadge('a11y-neutral', document.getElementById('hex-neutral').value, NEUTRAL_BACKGROUND);
