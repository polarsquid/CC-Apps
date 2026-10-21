// Mark mode helpers: built-in shapes and image uploads.
// Mark replacement is inspired by Ditherfy by Anton Burmistrov
// (antonburmistrov.com). This is an independent implementation.
(() => {
  'use strict';

  const SLOT = 256;               // every mark is stored at this size
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];

  const SHAPES = [
    { id: 'square',   name: 'Square' },
    { id: 'circle',   name: 'Circle' },
    { id: 'diamond',  name: 'Diamond' },
    { id: 'triangle', name: 'Triangle' },
    { id: 'plus',     name: 'Plus' },
    { id: 'cross',    name: 'Cross' },
    { id: 'ring',     name: 'Ring' },
    { id: 'star',     name: 'Star' },
    { id: 'hexagon',  name: 'Hexagon' },
    { id: 'hline',    name: 'Horizontal line' },
    { id: 'vline',    name: 'Vertical line' },
    { id: 'slash',    name: 'Slash' },
  ];

  function polygon(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  }

  // Draws a shape filling a size × size box centred on (cx, cy).
  function drawShape(ctx, id, cx, cy, size, colour = '#fff') {
    const h = size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = colour;
    switch (id) {
      case 'square': ctx.fillRect(-h, -h, size, size); break;
      case 'circle': ctx.beginPath(); ctx.arc(0, 0, h, 0, Math.PI * 2); ctx.fill(); break;
      case 'diamond': polygon(ctx, [[0, -h], [h, 0], [0, h], [-h, 0]]); break;
      case 'triangle': {
        const t = h * 0.92;
        polygon(ctx, [[0, -t], [h, t * 0.86], [-h, t * 0.86]]);
        break;
      }
      case 'plus': {
        const w = size * 0.3;
        ctx.fillRect(-w / 2, -h, w, size);
        ctx.fillRect(-h, -w / 2, size, w);
        break;
      }
      case 'cross': {
        const w = size * 0.26;
        const l = size * 1.25;
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-w / 2, -l / 2, w, l);
        ctx.fillRect(-l / 2, -w / 2, l, w);
        break;
      }
      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, h, 0, Math.PI * 2);
        ctx.arc(0, 0, h * 0.58, 0, Math.PI * 2, true);
        ctx.fill();
        break;
      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? h * 0.42 : h;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          pts.push([Math.cos(a) * r, Math.sin(a) * r + h * 0.06]);
        }
        polygon(ctx, pts);
        break;
      }
      case 'hexagon': {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 6 + (i * Math.PI) / 3;
          pts.push([Math.cos(a) * h, Math.sin(a) * h]);
        }
        polygon(ctx, pts);
        break;
      }
      case 'hline': ctx.fillRect(-h, -size * 0.14, size, size * 0.28); break;
      case 'vline': ctx.fillRect(-size * 0.14, -h, size * 0.28, size); break;
      case 'slash': {
        const w = size * 0.26;
        const l = size * 1.32;
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-w / 2, -l / 2, w, l);
        break;
      }
      default: ctx.fillRect(-h, -h, size, size);
    }
    ctx.restore();
  }

  const thumbCache = new Map();
  function shapeThumb(id, colour = '#fff') {
    const key = `${id}|${colour}`;
    if (!thumbCache.has(key)) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      drawShape(c.getContext('2d'), id, 32, 32, 46, colour);
      thumbCache.set(key, c.toDataURL());
    }
    return thumbCache.get(key);
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
      img.src = url;
    });
  }

  // Shrinks an upload to one 256px square (keeping its proportions) and makes
  // two versions: the original colours, and a white mask for recolouring.
  // Images with no transparency use their dark areas as the mask.
  async function processUpload(file) {
    if (!file || !TYPES.includes(file.type)) {
      throw new Error('Use an SVG, PNG, JPEG or WebP image.');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new Error('That image is over 10 MB. Try a smaller file.');
    }
    const img = await loadImage(file);
    const iw = img.naturalWidth || SLOT;
    const ih = img.naturalHeight || SLOT;
    const fit = Math.min(SLOT / iw, SLOT / ih);
    const w = Math.max(1, Math.round(iw * fit));
    const h = Math.max(1, Math.round(ih * fit));

    const orig = document.createElement('canvas');
    orig.width = orig.height = SLOT;
    const octx = orig.getContext('2d', { willReadFrequently: true });
    octx.drawImage(img, (SLOT - w) / 2, (SLOT - h) / 2, w, h);

    const data = octx.getImageData(0, 0, SLOT, SLOT);
    const px = data.data;
    const x0 = Math.floor((SLOT - w) / 2);
    const y0 = Math.floor((SLOT - h) / 2);
    let hasAlpha = false;
    for (let y = y0; y < y0 + h && !hasAlpha; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (px[(y * SLOT + x) * 4 + 3] < 250) { hasAlpha = true; break; }
      }
    }

    const mask = document.createElement('canvas');
    mask.width = mask.height = SLOT;
    const mctx = mask.getContext('2d');
    const out = mctx.createImageData(SLOT, SLOT);
    const o = out.data;
    for (let i = 0; i < px.length; i += 4) {
      let a = px[i + 3];
      if (!hasAlpha && a > 0) {
        const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        a = Math.round(255 - lum);
      }
      o[i] = o[i + 1] = o[i + 2] = 255;
      o[i + 3] = a;
    }
    mctx.putImageData(out, 0, 0);

    return { orig, mask, hasAlpha, name: file.name };
  }

  window.GGMarks = { SLOT, SHAPES, drawShape, shapeThumb, processUpload, TYPES };
})();
