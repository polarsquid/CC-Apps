/* The Quiet Grove: forest spirits
 *
 * spiritSVG(sleepy, outfit) returns the SVG markup for one spirit.
 *   sleepy: true for closed eyes (used on empty "Coming Soon" hollows)
 *   outfit: space-separated outfit names, e.g. "dark staff". Set on an app
 *           card with data-spirit="..." in index.html.
 *
 * This file must load BEFORE app.js, which calls spiritSVG.
 */

// Moss-cloaked forest spirit.
// Outfits (set with data-spirit="..." on a card, combine with spaces):
//   staff, dark, knight, dj (alias: synth), mummy, city, armor,
//   relaxed, fisher, painter, rager, hiker, runner
let spiritUid = 0;
function spiritSVG(sleepy, outfit) {
  const id = 'sp' + (spiritUid++);
  const has = w => (outfit || '').split(/\s+/).includes(w);
  const knight = has('knight'), staff = has('staff'), dark = has('dark');
  const dj = has('dj') || has('synth');
  const mummy = has('mummy'), city = has('city'), armor = has('armor'), relaxed = has('relaxed');
  const fisher = has('fisher'), painter = has('painter');
  const rager = has('rager'), hiker = has('hiker'), runner = has('runner');
  const plainBody = !mummy && !city && !armor && !runner;

  const left = 'M30,38 C22,38 15.5,41 14,46.5 C12,57 8.5,67 5,78 Q9,79.4 13,78.4 Q17,79.6 21,78.4 L24,78.2 C25.5,66 27.5,55 30,48Z';
  const right = 'M30,38 C38,38 44.5,41 46,46.5 C48,57 51.5,67 55,78 Q51,79.4 47,78.4 Q43,79.6 39,78.4 L36,78.2 C34.5,66 32.5,55 30,48Z';
  const headClip = `<clipPath id="${id}h"><ellipse cx="30" cy="28" rx="22" ry="14.5"/></clipPath>`;
  const metal = `
    <linearGradient id="${id}m" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".35" stop-color="#c3cbd2"/><stop offset=".6" stop-color="#8a949e"/><stop offset="1" stop-color="#5b646d"/></linearGradient>
    <linearGradient id="${id}s" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#66707a"/><stop offset=".3" stop-color="#dfe5ea"/><stop offset=".5" stop-color="#f7fafc"/><stop offset=".75" stop-color="#aab3bb"/><stop offset="1" stop-color="#5f6871"/></linearGradient>`;
  const M = `url(#${id}m)`, S = `url(#${id}s)`, edge = 'stroke="#4d565f" stroke-width=".8"';

  /* ----- eyes ----- */
  const eyesOpen = `<g class="look"><g class="eyes"><circle cx="21" cy="27" r="6.2" fill="#4a4b46"/><circle cx="39" cy="27" r="6.2" fill="#4a4b46"/><circle cx="21" cy="27" r="3.8" fill="#f29a1f"/><circle cx="39" cy="27" r="3.8" fill="#f29a1f"/><circle cx="21" cy="27" r="1.8" fill="#ffd166"/><circle cx="39" cy="27" r="1.8" fill="#ffd166"/><circle cx="22.2" cy="25.8" r=".85" fill="#fff8e6"/><circle cx="40.2" cy="25.8" r=".85" fill="#fff8e6"/></g></g>`;
  const eyesShut = `<path d="M16,28 Q21,31 26,28 M34,28 Q39,31 44,28" stroke="#4a4b46" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const eyes = sleepy ? eyesShut : eyesOpen;

  /* ----- behind the spirit ----- */
  let back = '';
  if (rager) {
    // the car is much wider than a spirit, so it gets a wider shadow
    back += `<ellipse cx="30" cy="87.6" rx="29" ry="2.6" fill="rgba(0,0,0,.3)"/>`;
  }
  if (hiker) {
    // a hopelessly over-packed rucksack: sleeping mat on top, bottle in the side pocket
    back += `
      <path d="M6,0 C6,-4.5 54,-4.5 54,0 L57.4,62 C57.4,66.4 2.6,66.4 2.6,62Z" fill="#c8662e"/>
      <path d="M6,0 L2.6,62 C2.6,64.6 5,65.6 8,65.8 L10.6,-2.6 C8,-2 6,-1.2 6,0Z M54,0 L57.4,62 C57.4,64.6 55,65.6 52,65.8 L49.4,-2.6 C52,-2 54,-1.2 54,0Z" fill="#a9521f"/>
      <path d="M6.6,2.2 C6.6,-3.4 53.4,-3.4 53.4,2.2 L53.6,9.4 C40,11.6 20,11.6 6.4,9.4Z" fill="#9a4a1c"/>
      <path d="M9,6.6 C22,8.4 38,8.4 51,6.6" stroke="#e0a25a" stroke-width=".7" stroke-dasharray="1.4 1" fill="none"/>
      <rect x="-1" y="40" width="7.6" height="18" rx="2.2" fill="#7a3a17"/>
      <path d="M0,43 L5.6,43 M0,46.4 L5.6,46.4 M0,49.8 L5.6,49.8" stroke="#a9521f" stroke-width=".6"/>
      <rect x="54" y="29" width="6" height="22" rx="2.6" fill="#4f9bc4"/>
      <rect x="54.9" y="25.8" width="4.2" height="3.8" rx=".8" fill="#2a2f33"/>
      <path d="M55.4,31 L55.4,40" stroke="#a6d6ee" stroke-width=".9" stroke-linecap="round"/>
      <rect x="53.4" y="42" width="7.6" height="16" rx="2.2" fill="#7a3a17"/>
      <rect x="4.6" y="-12.6" width="50.8" height="10.4" rx="5.2" fill="#3d6b8c"/>
      <path d="M8,-9.6 C20,-10.6 40,-10.6 52,-9.6" stroke="#5a88a8" stroke-width="1" fill="none"/>
      <ellipse cx="52.8" cy="-7.4" rx="2.6" ry="5.2" fill="#2f5672"/>
      <path d="M52.8,-10 C54.2,-9 54.2,-6 52.8,-5.4 C51.8,-6 51.9,-8 52.8,-8.4" stroke="#5a88a8" stroke-width=".7" fill="none"/>
      <path d="M15,-12.8 L15,-1.8 M45,-12.8 L45,-1.8" stroke="#2a2f33" stroke-width="1.8"/>`;
  }

  /* ----- legs ----- */
  let legs;
  if (rager) {
    legs = '';   // tucked away inside the car
  } else if (hiker) {
    // wool socks and chunky leather boots
    legs = `<path d="M17,75 L27,75 L26.6,81.4 L17.4,81.4Z" fill="#e6dcc6"/><path d="M33,75 L43,75 L42.6,81.4 L33.4,81.4Z" fill="#e6dcc6"/>
      <path d="M19,79 L19,81.2 M21,79 L21,81.2 M23,79 L23,81.2 M25,79 L25,81.2 M35,79 L35,81.2 M37,79 L37,81.2 M39,79 L39,81.2 M41,79 L41,81.2" stroke="#c9bda2" stroke-width=".6"/>
      <path d="M17.4,81 L26.6,81 L26.8,83.8 C28.8,84 29.8,85 29.6,86.4 L16.4,86.4 C16.2,84.6 16.7,82.4 17.4,81Z" fill="#7a4a26"/>
      <path d="M42.6,81 L33.4,81 L33.2,83.8 C31.2,84 30.2,85 30.4,86.4 L43.6,86.4 C43.8,84.6 43.3,82.4 42.6,81Z" fill="#7a4a26"/>
      <path d="M16.2,86 L29.8,86 L29.8,87.8 L16.2,87.8Z M30.2,86 L43.8,86 L43.8,87.8 L30.2,87.8Z" fill="#2a1c12"/>
      <path d="M19.6,82.4 L24.4,83.2 M19.6,84.2 L24.4,85 M40.4,82.4 L35.6,83.2 M40.4,84.2 L35.6,85" stroke="#e8a33a" stroke-width=".8" stroke-linecap="round"/>`;
  } else if (runner) {
    // legs pump up and down under the shorts; bright running shoes
    const leg = (x, cls, flip) => `<g class="${cls}">
        <rect x="${x - 3.6}" y="64" width="7.2" height="17" rx="3.4" fill="#c9ccc5"/>
        <path d="M${x - 3.4},78.6 L${x + 3.4},78.6" stroke="#f4f1ea" stroke-width="1.8"/>
        <path d="M${x - 4.6},79.6 L${x + 4.6},79.6 C${x + 5.8 * flip},79.8 ${x + 6.6 * flip},83 ${x + 5.6 * flip},84.4 L${x - 5.6 * flip},84.4 C${x - 6.2 * flip},83 ${x - 5.8 * flip},80.4 ${x - 4.6},79.6Z" fill="#f2611d"/>
        <path d="M${x - 5.8},84.2 L${x + 5.8},84.2 L${x + 5.6},86.6 L${x - 5.6},86.6Z" fill="#f4f1ea"/>
        <path d="M${x - 2.4},81 L${x + 2.4},81.6" stroke="#ffffff" stroke-width=".7" stroke-linecap="round"/>
      </g>`;
    legs = leg(23, 'leg-l', 1) + leg(37, 'leg-r', -1);
  } else if (mummy) {
    legs = `<path d="M17,75 L27,75 L25.2,86 C25,87.4 19,87.4 18.8,86Z" fill="#e8dfc8"/><path d="M33,75 L43,75 L41.2,86 C41,87.4 35,87.4 34.8,86Z" fill="#e8dfc8"/>
      <path d="M17.4,77.5 L26.6,79 M17.8,80.5 L26.2,82 M18.4,83.5 L25.6,85 M33.4,79 L42.6,77.5 M33.8,82 L42.2,80.5 M34.4,85 L41.6,83.5" stroke="#c4b795" stroke-width=".8"/>`;
  } else if (city) {
    legs = `<path d="M18,62 L29.2,62 L27.8,82.5 L19.4,82.5Z" fill="#35577f"/><path d="M30.8,62 L42,62 L40.6,82.5 L32.2,82.5Z" fill="#35577f"/>
      <path d="M23.6,64 L23.4,82 M36.4,64 L36.6,82" stroke="#5d82ad" stroke-width=".7"/>
      <path d="M19.2,80.6 L28,80.6 M32,80.6 L40.8,80.6" stroke="#4d73a0" stroke-width="1.6"/>
      <path d="M17.6,82.3 L28.4,82.3 C29.6,82.3 30.2,84.4 29.6,86.4 L17.4,86.4 C16.4,86.4 16.4,83.1 17.6,82.3Z" fill="#f2f0ea"/>
      <path d="M31.6,82.3 L42.4,82.3 C43.6,83.1 43.6,86.4 42.6,86.4 L30.4,86.4 C29.8,84.4 30.4,82.3 31.6,82.3Z" fill="#f2f0ea"/>
      <path d="M17,86.3 L29.8,86.3 M30.2,86.3 L43,86.3" stroke="#c9453b" stroke-width="1.2"/>`;
  } else if (armor) {
    legs = `<path d="M17,71 L27,71 L25.6,84 L18.4,84Z" fill="${S}" ${edge}/><path d="M33,71 L43,71 L41.6,84 L34.4,84Z" fill="${S}" ${edge}/>
      <circle cx="22" cy="74.5" r="3.3" fill="${M}" ${edge}/><circle cx="38" cy="74.5" r="3.3" fill="${M}" ${edge}/>
      <path d="M16.4,84 L27,84 C28.6,84 29.2,86.8 27.8,87.3 L16.4,87.3Z" fill="${M}" ${edge}/>
      <path d="M33,84 L43.6,84 L43.6,87.3 L32.2,87.3 C30.8,86.8 31.4,84 33,84Z" fill="${M}" ${edge}/>`;
  } else if (fisher) {
    legs = `<path d="M17,73 L27,73 L25.8,84.4 L18.2,84.4Z" fill="#46573a"/><path d="M33,73 L43,73 L41.8,84.4 L34.2,84.4Z" fill="#46573a"/>
      <path d="M17.2,75.2 L26.8,75.2 M33.2,75.2 L42.8,75.2" stroke="#2f3b26" stroke-width="1.6"/>
      <path d="M17,84 L27.6,84 C28.8,84 29.2,86.6 28.2,87.2 L17,87.2Z" fill="#2f3b26"/>
      <path d="M32.4,84 L43,84 L43,87.2 L31.8,87.2 C30.8,86.6 31.2,84 32.4,84Z" fill="#2f3b26"/>
      <path d="M20.5,77 L20.2,83 M39.5,77 L39.8,83" stroke="#5c6e4b" stroke-width=".8"/>`;
  } else {
    legs = `<path d="M17,75 L27,75 L25.2,86 C25,87.4 19,87.4 18.8,86Z" fill="#6b4a2e"/><path d="M33,75 L43,75 L41.2,86 C41,87.4 35,87.4 34.8,86Z" fill="#6b4a2e"/>
      <path d="M20,76 L21,86 M23.5,76 L23,85.5 M36,76 L37,86 M39.5,76 L39,85.5" stroke="#4a321f" stroke-width="1"/>`;
  }

  /* ----- body / clothing ----- */
  let body = '';
  if (plainBody) {
    // grey body showing through the front opening of the cloak
    body += `<rect x="20" y="40" width="20" height="39" rx="9" fill="#c9ccc5"/><path d="M28,50 L27,78 M32,50 L33,78" stroke="#b3b7b0" stroke-width="1.2"/>`;
    let fill = '';
    let cloakBase, cloakEdge, seam = '#2f4e20';
    if (dj) {
      // green sine waves that scroll sideways like a sound wave
      cloakBase = '#2b4a22'; cloakEdge = '#1c3317'; seam = '#1c3317';
      const cols = ['#4f7f34', '#6f9c46', '#87b05a', '#c9f27a', '#a6cf6a', '#87b05a', '#6f9c46', '#4f7f34'];
      const amps = [1.1, 1.8, 2.4, 3, 2.6, 2, 1.5, 1];
      let w = '';
      for (let row = 0; row < 8; row++) {
        const y = 40.5 + row * 5;
        let d = '';
        for (let x = -12; x <= 72; x += 2) {
          const yy = y + amps[row] * Math.sin((x + row * 2) / 12 * Math.PI * 2);
          d += (x === -12 ? 'M' : ' L') + x + ',' + yy.toFixed(2);
        }
        w += `<path d="${d}" stroke="${cols[row]}" stroke-width="${row === 3 ? 1.7 : 1.2}" fill="none" stroke-linecap="round"/>`;
      }
      fill = `<g class="wave-scroll">${w}</g>`;
    } else if (relaxed) {
      cloakBase = null; cloakEdge = 'rgba(30,40,30,.35)'; seam = 'rgba(30,40,30,.45)';
      let n = 0;
      for (let row = 0; row < 8; row++) {
        const y = 37 + row * 6, off = row % 2 ? 3 : 0;
        for (let x = 2 + off; x < 58; x += 6) {
          const up = (row + Math.round(x / 3)) % 2 === 0;
          const k = (n++ * 7 + row) % 4;
          const delay = (-(x * 0.12 + y * 0.18)).toFixed(2);   // colour drifts diagonally across the cloak
          const d = up ? `M${x},${y + 5.2} L${x + 3},${y} L${x + 6},${y + 5.2}Z` : `M${x},${y} L${x + 6},${y} L${x + 3},${y + 5.2}Z`;
          fill += `<path class="drift drift-${k}" style="animation-delay:${delay}s" d="${d}"/>`;
        }
      }
    } else if (painter) {
      // cream smock covered in thick dabs of paint
      cloakBase = '#ece5d3'; cloakEdge = '#b7ab8f'; seam = '#b7ab8f';
      const dabs = [[9, 70, 2.6, '#d9534f'], [16, 52, 2.2, '#3f7fbf'], [12, 62, 1.8, '#f0c13a'], [19, 74, 2.4, '#5aa469'],
                    [41, 50, 2, '#f0c13a'], [47, 61, 2.6, '#8a5cc0'], [44, 71, 2.2, '#d9534f'], [51, 75, 1.8, '#3f7fbf'],
                    [21, 45, 1.4, '#e8833a'], [38, 44, 1.4, '#5aa469'], [7, 76, 1.5, '#f0c13a'], [53, 68, 1.4, '#5aa469']];
      dabs.forEach(([x, y, r, c]) => {
        fill += `<path d="M${x - r},${y} C${x - r},${y - r * 1.3} ${x + r * 1.2},${y - r * 1.2} ${x + r},${y} C${x + r * 1.1},${y + r} ${x - r * .6},${y + r * 1.3} ${x - r},${y}Z" fill="${c}"/>`
              + `<circle cx="${x - r * .3}" cy="${y - r * .4}" r="${r * .3}" fill="#ffffff" opacity=".45"/>`;
      });
      fill += `<path d="M16,52 L15.6,56.5 M47,61 L47.4,66 M9,70 L8.8,73.6" stroke-width="1" stroke-linecap="round" stroke="#3f7fbf"/>`;
    } else {
      const shades = fisher ? ['#2c5560', '#3a6d74', '#4b8582', '#66a196']
        : dark ? ['#1f3719', '#29461f', '#335528', '#3f6531'] : ['#3e662a', '#5a8a3a', '#6f9c46', '#87b05a'];
      cloakBase = fisher ? '#355f66' : dark ? '#284420' : '#4f7a34';
      cloakEdge = fisher ? '#22444a' : dark ? '#1a2e14' : '#3a5f27';
      let n = 0;
      for (let row = 0; row < 8; row++) {
        const y = 37 + row * 6, off = row % 2 ? 3 : 0;
        for (let x = 2 + off; x < 58; x += 6) {
          const up = (row + Math.round(x / 3)) % 2 === 0;
          const c = shades[(n++ * 7 + row) % 4];
          fill += up
            ? `<path d="M${x},${y + 5.2} L${x + 3},${y} L${x + 6},${y + 5.2}Z" fill="${c}"/>`
            : `<path d="M${x},${y} L${x + 6},${y} L${x + 3},${y + 5.2}Z" fill="${c}"/>`;
        }
      }
    }
    body += `<defs><clipPath id="${id}c"><path d="${left}"/><path d="${right}"/></clipPath></defs>
      <g clip-path="url(#${id}c)"><rect x="0" y="36" width="60" height="46" ${cloakBase ? `fill="${cloakBase}"` : 'class="drift drift-0" style="animation-delay:-9s"'}/>${fill}</g>
      <path d="${left}" fill="none" stroke="${cloakEdge}" stroke-width="0.9"/>
      <path d="${right}" fill="none" stroke="${cloakEdge}" stroke-width="0.9"/>
      <path d="M30,48 C27.5,55 25.5,66 24,78.2 M30,48 C32.5,55 34.5,66 36,78.2" fill="none" stroke="${seam}" stroke-width="1.3"/>`;
  }

  if (mummy) {
    // wrapped from shoulders to feet in criss-crossing bandages
    const torso = 'M30,38 C22,38 15.5,41 14,46.5 C12.5,56 11.5,66 11,77.5 C16,79.6 44,79.6 49,77.5 C48.5,66 47.5,56 46,46.5 C44.5,41 38,38 30,38Z';
    let bands = '';
    for (let i = 0; i < 14; i++) {
      const y = 42 + i * 3.6;
      bands += `<path d="M0,${y} L60,${y - 8}" stroke="${i % 2 ? '#e2d8bf' : '#efe7d2'}" stroke-width="4"/><path d="M0,${y + 2} L60,${y - 6}" stroke="#c7ba98" stroke-width=".55"/>`;
    }
    bands += `<path d="M4,49 L56,61" stroke="#f4eddc" stroke-width="3.6"/><path d="M4,50.8 L56,62.8" stroke="#c7ba98" stroke-width=".55"/>
      <path d="M6,68 L54,74" stroke="#f4eddc" stroke-width="3.4"/><path d="M6,69.7 L54,75.7" stroke="#c7ba98" stroke-width=".55"/>`;
    body += `<defs><clipPath id="${id}t"><path d="${torso}"/></clipPath></defs>
      <path d="${torso}" fill="#e8dfc8"/><g clip-path="url(#${id}t)">${bands}</g>
      <path d="${torso}" fill="none" stroke="#b9ab88" stroke-width=".8"/>`;
  }

  if (city) {
    // t-shirt with a little isometric cube, open denim jacket, one arm raised with the drink
    body += `
      <path d="M21.5,40.5 L38.5,40.5 L40,64 L20,64Z" fill="#e8b84a"/>
      <path d="M30,48.6 L33.6,50.6 L30,52.6 L26.4,50.6Z" fill="#f6f1e3"/>
      <path d="M26.4,50.6 L30,52.6 L30,56.8 L26.4,54.8Z" fill="#4a78ab"/>
      <path d="M30,52.6 L33.6,50.6 L33.6,54.8 L30,56.8Z" fill="#2c4f78"/>
      <path d="M30,38 C22,38 16,41 14.5,46 C13.5,53 13.2,59 13.5,65 L23.8,65 C24.6,58 26,50.5 28.4,43Z" fill="#4a78ab"/>
      <path d="M30,38 C38,38 44,41 45.5,46 C46.5,53 46.8,59 46.5,65 L36.2,65 C35.4,58 34,50.5 31.6,43Z" fill="#4a78ab"/>
      <path d="M23.4,40.4 L28.4,43 L25.4,48.5Z M36.6,40.4 L31.6,43 L34.6,48.5Z" fill="#35618f"/>
      <path d="M15.2,63 L23,63 M37,63 L44.8,63 M27.2,45 C25.6,51 24.6,57 24,63.5 M32.8,45 C34.4,51 35.4,57 36,63.5" stroke="#9dbbe0" stroke-width=".6" stroke-dasharray="1.2 1.1" fill="none"/>
      <rect x="16.6" y="50" width="5.4" height="4.6" rx=".8" fill="none" stroke="#9dbbe0" stroke-width=".6" stroke-dasharray="1.1 1"/>
      <path d="M15.6,46.5 C13,52 12,58 12.4,62.6" stroke="#4a78ab" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="12.5" cy="64.6" rx="2.7" ry="3" fill="#c9ccc5"/>`;
  }

  if (runner) {
    // racing singlet with a race bib, short shorts, arms pumping
    const arm = (sx, ex, hx, cls) => `<g class="${cls}">
        <path d="M${sx},43.4 L${ex},51.6 L${hx},55.2" stroke="#c9ccc5" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse cx="${hx}" cy="55.4" rx="2.6" ry="2.7" fill="#c9ccc5"/>
      </g>`;
    body += `
      <rect x="19" y="39" width="22" height="26" rx="9" fill="#c9ccc5"/>
      <path d="M21.6,39.4 C24,42.6 36,42.6 38.4,39.4 L41,45.6 C40.4,51 40.8,57 41.4,64 L18.6,64 C19.2,57 19.6,51 19,45.6Z" fill="#f2611d"/>
      <path d="M21.6,39.4 C24,42.6 36,42.6 38.4,39.4 M21.6,39.4 L19,45.6 M38.4,39.4 L41,45.6" stroke="#c8410f" stroke-width="1" fill="none"/>
      <rect x="23.2" y="47.4" width="13.6" height="10.2" rx="1" fill="#f7f5ef" stroke="#d8d2c4" stroke-width=".5"/>
      <rect x="23.2" y="47.4" width="13.6" height="2" fill="#2b3440"/>
      <text x="30" y="56.4" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="6.6" fill="#2a2f33">42</text>
      <circle cx="24.2" cy="50.4" r=".5" fill="#9aa4ad"/><circle cx="35.8" cy="50.4" r=".5" fill="#9aa4ad"/>
      <circle cx="24.2" cy="56.6" r=".5" fill="#9aa4ad"/><circle cx="35.8" cy="56.6" r=".5" fill="#9aa4ad"/>
      <path d="M18.4,62.4 L41.6,62.4 L42.4,71 L31.4,71 L30,67.2 L28.6,71 L17.6,71Z" fill="#2b3440"/>
      <path d="M18.9,63 L18.2,70.6 M41.1,63 L41.8,70.6" stroke="#f2611d" stroke-width="1"/>
      ${arm(18.4, 14.6, 19.8, 'arm-l')}
      ${arm(41.6, 45.4, 40.2, 'arm-r')}
      <g class="arm-l"><rect x="15.6" y="52.6" width="3.8" height="3" rx=".7" fill="#23262a" transform="rotate(35 17.5 54.1)"/><rect x="16.4" y="53.3" width="2.2" height="1.6" rx=".3" fill="#f2611d" transform="rotate(35 17.5 54.1)"/></g>`;
  }

  if (armor) {
    // polished plate: pauldrons, long breastplate, vambraces
    body += `
      <rect x="8.4" y="46" width="6.2" height="16" rx="3" fill="${S}" ${edge}/>
      <rect x="45.4" y="46" width="6.2" height="16" rx="3" fill="${S}" ${edge}/>
      <circle cx="11.5" cy="64" r="3.3" fill="${M}" ${edge}/><circle cx="48.5" cy="64" r="3.3" fill="${M}" ${edge}/>
      <path d="M15.5,42 C20,38.5 40,38.5 44.5,42 L46.2,70.5 C40,74 20,74 13.8,70.5Z" fill="${S}" ${edge}/>
      <path d="M30,40 L30,72.8" stroke="#ffffff" stroke-width=".8" opacity=".6"/>
      <path d="M16.8,57 C24,60 36,60 43.2,57" stroke="#6c757e" stroke-width=".8" fill="none"/>
      <path class="glint" d="M20,44.5 C22.2,52 22.4,60 21,67" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22,40.4 C26,42.8 34,42.8 38,40.4 L37,37.6 C33,39.2 27,39.2 23,37.6Z" fill="${M}" ${edge}/>
      <path d="M8.6,47.5 C7.6,40.5 15,37.6 21,40.6 C19,43 18,46 18,49.2 C15,48.2 12,47.7 8.6,47.5Z" fill="${S}" ${edge}/>
      <path d="M51.4,47.5 C52.4,40.5 45,37.6 39,40.6 C41,43 42,46 42,49.2 C45,48.2 48,47.7 51.4,47.5Z" fill="${S}" ${edge}/>
      <path d="M10,44.5 C12.5,42 16,41.4 19.4,42.6 M50,44.5 C47.5,42 44,41.4 40.6,42.6" stroke="#6c757e" stroke-width=".7" fill="none"/>`;
  }

  /* ----- ears ----- */
  const earShapeL = 'M15.5,18.5 C20,10 15,-1 6,-5 C2.5,3 8,13 15.5,18.5Z';
  const earShapeR = 'M44.5,18.5 C40,10 45,-1 54,-5 C57.5,3 52,13 44.5,18.5Z';
  let earL, earR;
  if (armor) {
    earL = `<path d="${earShapeL}" fill="${S}" ${edge}/><path d="M14,15 C13,9 10,3 7,-1" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".7"/>`;
    earR = `<path d="${earShapeR}" fill="${S}" ${edge}/><path d="M46,15 C47,9 50,3 53,-1" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".7"/>`;
  } else {
    const patchL = mummy
      ? `<path d="M7.5,4 L14.5,1 M10,11 L16.5,8.6" stroke="#ece4cf" stroke-width="2.6"/><path d="M7.8,5.2 L14.6,2.3 M10.2,12.2 L16.6,9.8" stroke="#c7ba98" stroke-width=".5"/>`
      : `<path d="M8,3 L11,4 L10.5,8 L7.5,7Z" fill="#6f9c46"/>`;
    const patchR = mummy
      ? `<path d="M52.5,4 L45.5,1 M50,11 L43.5,8.6" stroke="#ece4cf" stroke-width="2.6"/><path d="M52.2,5.2 L45.4,2.3 M49.8,12.2 L43.4,9.8" stroke="#c7ba98" stroke-width=".5"/>`
      : `<path d="M51,1 L54,1.5 L53,5 L50.5,4Z" fill="#87b05a"/>`;
    earL = `<path d="${earShapeL}" fill="#cfd2cc"/><path d="M14,15 C13,9 10,3 7,-1" fill="none" stroke="#b3b7b0" stroke-width="${knight ? 1.4 : 1}"/>${patchL}`;
    earR = `<path d="${earShapeR}" fill="#cfd2cc"/><path d="M46,15 C47,9 50,3 53,-1" fill="none" stroke="#b3b7b0" stroke-width="${knight ? 1.4 : 1}"/>${patchR}`;
  }
  const ears = knight
    ? `<g transform="translate(15.5 18.5) scale(.6) translate(-15.5 -18.5)">${earL}</g><g transform="translate(44.5 18.5) scale(.6) translate(-44.5 -18.5)">${earR}</g>`
    : earL + earR;

  const antlers = knight ? `
    <g fill="none" stroke="#d9c9a3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24,15 C23,8 21,2 18,-5 M21.5,5 C18,3.5 15,1 13,-2 M19.5,0 C18,-4 17,-7 14,-10 M18.5,-3 C20,-6 21,-9 22,-12"/>
      <path d="M36,15 C37,9 39,4 41,-2 M38.5,7 C41.5,6 44,4 46,1 M40.5,1 C42,-2 43,-4 45,-6"/>
    </g>
    <path d="M22.5,14 L25.5,14 M34.5,14 L37.5,14" stroke="#b8a680" stroke-width="2" stroke-linecap="round"/>` : '';

  /* ----- head ----- */
  let head, face;
  if (armor) {
    // full helm with a visor slit; the amber eyes glow inside
    const slitEyes = sleepy
      ? `<path d="M17.5,27.8 L24.5,27.8 M35.5,27.8 L42.5,27.8" stroke="#8a5a1c" stroke-width="1.2" stroke-linecap="round"/>`
      : `<g class="look"><circle cx="21" cy="27.6" r="4" fill="rgba(242,154,31,.35)"/><circle cx="39" cy="27.6" r="4" fill="rgba(242,154,31,.35)"/><circle cx="21" cy="27.6" r="2.1" fill="#f29a1f"/><circle cx="39" cy="27.6" r="2.1" fill="#f29a1f"/><circle cx="21" cy="27.6" r="1" fill="#ffd166"/><circle cx="39" cy="27.6" r="1" fill="#ffd166"/></g>`;
    head = `<ellipse cx="30" cy="28" rx="22.6" ry="15" fill="${S}" ${edge}/>
      <path d="M30,13.2 L30,24" stroke="#ffffff" stroke-width="1" opacity=".7"/>
      <path d="M30,13.2 L30,24" stroke="#6c757e" stroke-width=".6" transform="translate(.9 0)"/>
      <path class="glint" d="M15.5,18.5 C21,15 28,14 34,14.3" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    face = `<path d="M11.8,25 C18,23.2 42,23.2 48.2,25 L47.7,30.6 C42,32.3 18,32.3 12.3,30.6Z" fill="#15181c"/>
      ${slitEyes}
      <g fill="#3a4148">${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${35 + c * 2.4}" cy="${34.4 + r * 2.2}" r=".65"/>`).join('')).join('')}</g>
      <circle cx="10.4" cy="28" r=".9" fill="#4d565f"/><circle cx="49.6" cy="28" r=".9" fill="#4d565f"/>`;
  } else {
    head = `<ellipse cx="30" cy="28" rx="22" ry="14.5" fill="#b9bdb6"/>
      <ellipse cx="30" cy="26.6" rx="21.4" ry="13.2" fill="#cfd2cc"/>
      <ellipse cx="19" cy="18.5" rx="4" ry="1.6" fill="#e2e4df" transform="rotate(-20 19 18.5)"/>`;
    const noseY = city ? 34.3 : 31.8;
    face = `${eyes}<path d="M28.9,${noseY} L31.1,${noseY}" stroke="#7d807a" stroke-width="1.1" stroke-linecap="round"/>`;
    if (relaxed && !sleepy) {
      face += `<path d="M14.4,27.6 A6.6,6.6 0 0 1 27.6,27.6 Z M32.4,27.6 A6.6,6.6 0 0 1 45.6,27.6 Z" fill="#c4c8c1"/>
        <path d="M14.6,27.6 Q21,28.6 27.4,27.6 M32.6,27.6 Q39,28.6 45.4,27.6" stroke="#4a4b46" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27.4,34.4 Q30,36.4 32.6,34.4" stroke="#7d807a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <ellipse cx="15.5" cy="34.5" rx="3" ry="1.6" fill="#e9a08a" opacity=".35"/><ellipse cx="44.5" cy="34.5" rx="3" ry="1.6" fill="#e9a08a" opacity=".35"/>`;
    }
    if (rager && !sleepy) {
      // furious: heavy lids, knitted brows, gritted teeth, flushed cheeks, a throbbing vein
      face += `<path d="M13.6,18 L28,18 L28,24.4 L13.6,20.2Z M46.4,18 L32,18 L32,24.4 L46.4,20.2Z" fill="#cfd2cc"/>
        <path d="M14.2,19.8 L27.4,24.2 M45.8,19.8 L32.6,24.2" stroke="#4a4b46" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="14.6" cy="34.6" rx="3.4" ry="1.8" fill="#e0564a" opacity=".5"/><ellipse cx="45.4" cy="34.6" rx="3.4" ry="1.8" fill="#e0564a" opacity=".5"/>
        <rect x="25" y="33.8" width="10" height="4.4" rx="1.6" fill="#f6f3ea" stroke="#4a4b46" stroke-width=".9"/>
        <path d="M27.5,34 L27.5,38 M30,34 L30,38 M32.5,34 L32.5,38 M25.3,36 L34.7,36" stroke="#9a9c96" stroke-width=".5"/>
        <g class="vein" fill="none" stroke="#d9433b" stroke-width="1.3" stroke-linecap="round">
          <path d="M40.6,17.4 Q42.6,17.8 42.8,15.6 M45.2,15.6 Q45.4,17.8 47.4,17.4 M40.6,20.6 Q42.6,20.2 42.8,22.4 M45.2,22.4 Q45.4,20.2 47.4,20.6"/>
        </g>`;
    }
    if (hiker && !sleepy) {
      face += `<path d="M27.4,34.4 Q30,36.6 32.6,34.4" stroke="#7d807a" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    }
    if (runner && !sleepy) {
      // puffing: little open mouth, rosy cheeks
      face += `<ellipse cx="30" cy="35.4" rx="1.7" ry="1.4" fill="#4a4b46"/>
        <ellipse cx="15.5" cy="34.5" rx="3" ry="1.6" fill="#e9806a" opacity=".45"/><ellipse cx="44.5" cy="34.5" rx="3" ry="1.6" fill="#e9806a" opacity=".45"/>`;
    }
    if (mummy) {
      // bandages over the head, leaving a gap for the eyes
      face += `<g clip-path="url(#${id}h)">
        <path d="M2,11.5 L58,13.5" stroke="#efe7d2" stroke-width="4.4"/><path d="M2,13.7 L58,15.7" stroke="#c7ba98" stroke-width=".5"/>
        <path d="M4,20.4 L56,15.4" stroke="#e6dcc4" stroke-width="4"/><path d="M4,22.4 L56,17.4" stroke="#c7ba98" stroke-width=".5"/>
        <path d="M4,38.6 L56,32.4" stroke="#efe7d2" stroke-width="4.2"/><path d="M4,40.6 L56,34.4" stroke="#c7ba98" stroke-width=".5"/>
        <path d="M6,43 L54,39.5" stroke="#e6dcc4" stroke-width="3.6"/>
      </g>`;
    }
    if (city) {
      face += `<g>
        <rect x="13.2" y="21.6" width="15.2" height="10.2" rx="4" fill="#15171c"/>
        <rect x="31.6" y="21.6" width="15.2" height="10.2" rx="4" fill="#15171c"/>
        <path d="M28.4,24.6 Q30,23.1 31.6,24.6" stroke="#15171c" stroke-width="1.7" fill="none"/>
        <path d="M13.4,24.6 L8.4,23 M46.6,24.6 L51.6,23" stroke="#15171c" stroke-width="1.3"/>
        <path d="M15.8,24.2 L20.4,24.2 M34.2,24.2 L38.8,24.2" stroke="#6b7385" stroke-width="1.1" stroke-linecap="round"/>
      </g>`;
    }
  }

  /* ----- accessories ----- */
  let extras = '';
  if (dj) {
    // bulky headphones + drifting music notes
    extras += `
      <path d="M8,27 C8,3 52,3 52,27" fill="none" stroke="#23262a" stroke-width="4.8" stroke-linecap="round"/>
      <path d="M11.4,18.5 C15.5,8.6 44.5,8.6 48.6,18.5" fill="none" stroke="#4b5057" stroke-width="1.1"/>
      <path d="M22,8.4 C27,6.8 33,6.8 38,8.4" fill="none" stroke="#3a3f45" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="1.2" y="18.6" width="10.4" height="17.6" rx="5.2" fill="#23262a"/>
      <rect x="48.4" y="18.6" width="10.4" height="17.6" rx="5.2" fill="#23262a"/>
      <rect x="8.6" y="20.8" width="4.2" height="13.2" rx="2.1" fill="#3a3f45"/>
      <rect x="47.2" y="20.8" width="4.2" height="13.2" rx="2.1" fill="#3a3f45"/>
      <circle cx="6.4" cy="27.4" r="3.3" fill="none" stroke="#c9f27a" stroke-width="1.1"/>
      <circle cx="53.6" cy="27.4" r="3.3" fill="none" stroke="#c9f27a" stroke-width="1.1"/>
      <circle cx="6.4" cy="27.4" r="1" fill="#c9f27a"/><circle cx="53.6" cy="27.4" r="1" fill="#c9f27a"/>
      <g class="note" fill="#c9f27a" stroke="#c9f27a">
        <path d="M52.6,-1 L52.6,-8.6 L57,-10 L57,-2.4" fill="none" stroke-width="1"/>
        <circle cx="51.6" cy="-.6" r="1.5" stroke="none"/><circle cx="56" cy="-2" r="1.5" stroke="none"/>
      </g>
      <g class="note note-2" fill="#a6cf6a" stroke="#a6cf6a">
        <path d="M5.6,0 L5.6,-6.6" fill="none" stroke-width="1"/>
        <path d="M5.6,-6.6 C7.6,-5.6 8.4,-4.6 8,-3" fill="none" stroke-width="1"/>
        <circle cx="4.6" cy=".4" r="1.5" stroke="none"/>
      </g>`;
  }
  if (city) {
    // tall cup with a straw, held up to sip
    extras += `
      <path d="M43.8,33.4 L52.6,33.4 L51.4,57 L45,57Z" fill="#f4efe4" stroke="#cfc8b8" stroke-width=".6"/>
      <path d="M44.3,42 L52.1,42 L51.8,48.6 L44.6,48.6Z" fill="#9b6b43"/>
      <path d="M46.4,45.3 L50,45.3" stroke="#f4efe4" stroke-width=".7"/>
      <rect x="43" y="31.4" width="10.4" height="2.4" rx="1" fill="#ffffff" stroke="#cfc8b8" stroke-width=".6"/>
      <path d="M48.6,31.6 L48.6,24.4 L34.4,35.2" stroke="#6fbf73" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44.2,45.6 C47.4,49.2 48.8,52.6 47.6,53.6" stroke="#4a78ab" stroke-width="5.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="47.6" cy="52.4" rx="3" ry="3.2" fill="#c9ccc5"/>`;
  }
  if (relaxed) {
    extras += `
      <g class="steam" fill="none" stroke="#eef2ea" stroke-width="1.1" stroke-linecap="round">
        <path d="M27.8,50.5 C26.6,48.6 29,47.4 27.8,45.4"/>
        <path class="steam-2" d="M32,50.5 C30.8,48.6 33.2,47.4 32,45.4"/>
      </g>
      <path d="M23.6,51.4 L36.4,51.4 L35.2,59.2 C34.6,61.4 25.4,61.4 24.8,59.2Z" fill="#d9c4a0" stroke="#a88a5c" stroke-width=".7"/>
      <path d="M24,54 L36,54" stroke="#7fa453" stroke-width="1.6"/>
      <ellipse cx="30" cy="51.4" rx="6.4" ry="1.3" fill="#8a5a2b"/>
      <ellipse cx="23" cy="56.4" rx="3" ry="3.2" fill="#c9ccc5"/>
      <ellipse cx="37" cy="56.4" rx="3" ry="3.2" fill="#c9ccc5"/>`;
  }
  if (mummy) {
    // loose ribbon ends fluttering in the breeze
    extras += `
      <path class="ribbon-tail" d="M46,60 C52,63 50,70 55,75 C57.5,78 56,82 58.5,86" stroke="#b9ab88" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      <path class="ribbon-tail" d="M46,60 C52,63 50,70 55,75 C57.5,78 56,82 58.5,86" stroke="#ece4cf" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path class="ribbon-tail ribbon-2" d="M41,16 C46,11 50,13.5 55.5,8.5" stroke="#b9ab88" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path class="ribbon-tail ribbon-2" d="M41,16 C46,11 50,13.5 55.5,8.5" stroke="#ece4cf" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }
  if (knight) {
    extras += `
      <g transform="rotate(-12 8 62)">
        <path d="M6.4,60 L6.4,32 L8,28.5 L9.6,32 L9.6,60Z" fill="#dfe4e8" stroke="#8e979e" stroke-width=".6"/>
        <path d="M8,31 L8,58" stroke="#aab2b8" stroke-width=".6"/>
        <rect x="2.3" y="59.5" width="11.4" height="2.6" rx="1.2" fill="#9a7a3e"/>
        <rect x="6.7" y="62" width="2.6" height="6" fill="#5a3f27"/>
        <circle cx="8" cy="69" r="1.6" fill="#9a7a3e"/>
        <ellipse cx="8" cy="64.5" rx="3.2" ry="3.4" fill="#4f7a34"/>
      </g>
      <rect x="37" y="47" width="22" height="29" rx="2.6" fill="#6b4a2e" stroke="#4a321f" stroke-width="1.6"/>
      <path d="M41,49 C42,56 40,63 41.5,74 M45.5,49 L46.5,74 M50,49 C49,57 51,64 50,74 M54.5,49 L55,74" stroke="#4a321f" stroke-width="1" fill="none"/>
      <ellipse cx="48" cy="60" rx="2.6" ry="3.6" fill="#5a3d25" stroke="#4a321f" stroke-width=".9"/>
      <path d="M37.5,53 L58.5,53 M37.5,70 L58.5,70" stroke="#3a2718" stroke-width="1.4"/>
      <path d="M38,76 C44,74 52,74 58,76" stroke="#6f9c46" stroke-width="1.6" fill="none"/>`;
  }
  if (fisher) {
    // bucket hat with a fly, rod in hand, a little fish wriggling on the line
    extras += `
      <path d="M18,15.8 C18.4,6.8 41.6,6.8 42,15.8Z" fill="#a8945c"/>
      <path d="M18.6,13.4 L41.4,13.4" stroke="#5c4a2a" stroke-width="2.2"/>
      <ellipse cx="30" cy="16" rx="17" ry="3" fill="#b9a46a"/>
      <ellipse cx="30" cy="15.4" rx="13" ry="1.4" fill="#8f7c4a" opacity=".6"/>
      <path d="M36,12.6 L39.6,9.6" stroke="#d9534f" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M36.2,12.4 L38.6,10.8" stroke="#f0c13a" stroke-width=".9" stroke-linecap="round"/>
      <path d="M50.4,58 L59.5,-6" stroke="#6b4a2e" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M50.4,58 L51.6,49.6" stroke="#c49a6c" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="52.4" cy="53.2" r="2.1" fill="#9aa4ad" stroke="#5b646d" stroke-width=".6"/>
      <g class="fishline">
        <path d="M59.5,-6 C61,6 60.4,18 59.6,30" stroke="#e8eef0" stroke-width=".5" fill="none"/>
        <g class="fish">
          <path d="M59.6,30 C62.4,31.6 62.6,36 59.6,38.6 C56.6,36 56.8,31.6 59.6,30Z" fill="#e8833a"/>
          <path d="M59.6,38.2 L62,42 L57.2,42Z" fill="#d9534f"/>
          <circle cx="58.6" cy="32.6" r=".55" fill="#2a2f33"/>
          <path d="M58,35 C59,35.6 60.2,35.6 61.2,35" stroke="#f0c13a" stroke-width=".6" fill="none"/>
        </g>
      </g>
      <ellipse cx="50" cy="56.6" rx="3" ry="3.2" fill="#c9ccc5"/>`;
  }
  if (painter) {
    // tilted beret, a paint smudge, a palette and a brush that dabs
    extras += `
      <path d="M15.5,15.6 C14,8.6 26,4.2 36,6.2 C44,7.8 46.6,12.4 44,15.2 C36,13.8 24,14 15.5,15.6Z" fill="#8e2f3b"/>
      <path d="M16.2,15.4 C24,13.6 36,13.4 43.8,15" stroke="#6b2029" stroke-width="1.2" fill="none"/>
      <path d="M30,5.4 L30.6,2.6" stroke="#6b2029" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="44.5" cy="34.2" rx="2.4" ry="1.3" fill="#3f7fbf" opacity=".75" transform="rotate(-15 44.5 34.2)"/>
      <path d="M1.5,56 C1,50 8,47.6 14.6,49 C20,50.2 21.4,54 18.6,55.6 C16.6,56.8 17.8,59.2 15.6,61 C11.6,64.2 2,62.2 1.5,56Z" fill="#c49a6c" stroke="#8a6440" stroke-width=".7"/>
      <ellipse cx="15.4" cy="53.6" rx="1.6" ry="1.2" fill="#8a6440"/>
      <circle cx="5.4" cy="54" r="1.6" fill="#d9534f"/><circle cx="8.6" cy="51.4" r="1.5" fill="#f0c13a"/>
      <circle cx="12" cy="50.8" r="1.4" fill="#3f7fbf"/><circle cx="5.8" cy="58.4" r="1.5" fill="#5aa469"/>
      <circle cx="10" cy="59.6" r="1.4" fill="#f4f1ea"/>
      <ellipse cx="15" cy="56.4" rx="3" ry="3.2" fill="#c9ccc5"/>
      <g class="brush">
        <path d="M48.6,58 L56.4,40" stroke="#c0392b" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M55.6,41.8 L57.6,37.4" stroke="#b8bfc6" stroke-width="1.9"/>
        <path d="M57.4,37.8 C57.8,35.6 59,34.4 59.6,33.6 C59.8,35 59.4,36.8 58.2,38.4Z" fill="#8a5cc0"/>
        <ellipse cx="49.6" cy="55.6" rx="3" ry="3.2" fill="#c9ccc5"/>
      </g>`;
  }
  if (rager) {
    // stuck in a little convertible: one hand on the wheel, one fist shaking, steam coming off the top
    extras += `
      <g class="puff" fill="#eef1ec"><circle cx="19" cy="8.4" r="2.4"/><circle cx="21.6" cy="7.2" r="2.8"/><circle cx="20.2" cy="5" r="2.2"/></g>
      <g class="puff puff-2" fill="#eef1ec"><circle cx="41" cy="8.4" r="2.4"/><circle cx="38.4" cy="7.2" r="2.8"/><circle cx="39.8" cy="5" r="2.2"/></g>
      <ellipse cx="30" cy="48.6" rx="9" ry="3" fill="none" stroke="#1d2024" stroke-width="2"/>
      <path d="M30,48.6 L30,51.6" stroke="#1d2024" stroke-width="1.6"/>
      <ellipse cx="38.2" cy="47.4" rx="2.7" ry="2.5" fill="#c9ccc5"/>
      <path d="M8,52.4 L12.2,40 L47.8,40 L52,52.4Z" fill="rgba(190,225,240,.28)" stroke="#2a2f35" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M15,50.6 L19,41.6 M18.6,50.6 L21.4,44.8" stroke="#ffffff" stroke-width=".9" opacity=".45" stroke-linecap="round"/>
      <path d="M52,48.4 L56.6,47.6" stroke="#2a2f35" stroke-width="1.2"/>
      <rect x="55" y="44.6" width="5" height="4" rx="1.6" fill="#9e2f22" stroke="#2a2f35" stroke-width=".6"/>
      <rect x="3" y="75" width="9" height="12.6" rx="3" fill="#1d2024"/><rect x="48" y="75" width="9" height="12.6" rx="3" fill="#1d2024"/>
      <path d="M2,57 C2,54 5,52.2 9,52.2 L51,52.2 C55,52.2 58,54 58,57 L58,80.6 C58,82.4 56.6,83.6 54.6,83.6 L5.4,83.6 C3.4,83.6 2,82.4 2,80.6Z" fill="#c8402f" stroke="#8a2a21" stroke-width=".8"/>
      <path d="M8,54.6 C20,53.6 40,53.6 52,54.6" stroke="#e86a58" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="10" cy="62.4" r="4.2" fill="#fff3c4" stroke="#8a2a21" stroke-width=".8"/><circle cx="10" cy="62.4" r="2.2" fill="#fffbe9"/>
      <circle cx="50" cy="62.4" r="4.2" fill="#fff3c4" stroke="#8a2a21" stroke-width=".8"/><circle cx="50" cy="62.4" r="2.2" fill="#fffbe9"/>
      <path d="M5.2,57.6 L14.8,57.6 L14.8,61.2 L5.2,58.8Z M54.8,57.6 L45.2,57.6 L45.2,61.2 L54.8,58.8Z" fill="#c8402f"/>
      <path d="M5.4,58.8 L14.8,61.2 M54.6,58.8 L45.2,61.2" stroke="#8a2a21" stroke-width="1.1" stroke-linecap="round"/>
      <rect x="20" y="59.6" width="20" height="8.4" rx="2.4" fill="#2a1d1b"/>
      <path d="M21.6,62 L38.4,62 M21.6,64 L38.4,64 M21.6,66 L38.4,66" stroke="#5a4440" stroke-width=".8"/>
      <rect x="1" y="77.2" width="58" height="3.6" rx="1.8" fill="#b8bfc6" stroke="#6c757e" stroke-width=".5"/>
      <rect x="20.6" y="70" width="18.8" height="6.8" rx="1.2" fill="#f4d03f" stroke="#2a2f33" stroke-width=".6"/>
      <text x="30" y="75.4" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="5" letter-spacing=".4" fill="#2a2f33">GRR</text>
      <g class="fist">
        <path d="M16,47.4 C11,46.4 6.6,42.4 4.8,36.4" stroke="#4f7a34" stroke-width="4.6" fill="none" stroke-linecap="round"/>
        <circle cx="4.4" cy="33.4" r="3.4" fill="#c9ccc5"/>
        <path d="M2.2,32 Q4.4,30.8 6.6,32 M2.4,34 L6.4,34" stroke="#a9ada6" stroke-width=".6" fill="none"/>
      </g>`;
  }
  if (hiker) {
    // pack straps and hip belt, a woolly beanie, a trekking pole and a tin mug swinging off the pack
    extras += `
      <path d="M21.4,40.2 C19.4,46 18.6,52 19,61 M38.6,40.2 C40.6,46 41.4,52 41,61" stroke="#8a3f17" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M19.4,50 L40.6,50" stroke="#2a2f33" stroke-width="1.3"/><rect x="28.2" y="48.7" width="3.6" height="2.6" rx=".6" fill="#2a2f33"/>
      <path d="M11.2,64.4 C20,66.2 40,66.2 48.8,64.4" stroke="#8a3f17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="27.6" y="63.8" width="4.8" height="3.4" rx=".8" fill="#2a2f33"/><rect x="28.6" y="64.6" width="2.8" height="1.8" rx=".4" fill="#9aa4ad"/>
      <path d="M17,16.4 C16.6,5.4 43.4,5.4 43,16.4Z" fill="#b8433a"/>
      <path d="M16.6,13.4 C24,12 36,12 43.4,13.4 L43.6,17.6 C36,16.2 24,16.2 16.4,17.6Z" fill="#8e2f2a"/>
      <path d="M19,13 L19,17.2 M22,12.6 L22,16.8 M25,12.4 L25,16.6 M28,12.3 L28,16.5 M31,12.3 L31,16.5 M34,12.4 L34,16.6 M37,12.6 L37,16.8 M40,13 L40,17.2" stroke="#6b2220" stroke-width=".6"/>
      <circle cx="30" cy="5.4" r="3.4" fill="#efe7d6"/><path d="M28.2,4.2 L29.4,5.4 M31,3.6 L31.6,5.2 M29.8,6.6 L31.4,7" stroke="#cfc5ad" stroke-width=".6" stroke-linecap="round"/>
      <path d="M51.4,50 L55.2,87.4" stroke="#9aa4ad" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="54.7" cy="83.2" rx="2.2" ry=".8" fill="#2a2f33"/>
      <path d="M50.8,46.4 L51.8,55" stroke="#2a2f33" stroke-width="2.8" stroke-linecap="round"/>
      <ellipse cx="51.2" cy="56.4" rx="3" ry="3.2" fill="#c9ccc5"/>
      <g class="swing">
        <ellipse cx="2" cy="44.4" rx="1.3" ry="2.2" fill="none" stroke="#b8bfc6" stroke-width=".8"/>
        <path d="M-1.6,47.2 L5.6,47.2 L5.2,53.4 C5.2,54.4 -1.2,54.4 -1.2,53.4Z" fill="#e9eef2" stroke="#5b646d" stroke-width=".6"/>
        <path d="M-1.6,48.2 L5.6,48.2" stroke="#3f7fbf" stroke-width=".9"/>
        <path d="M-1.5,48.8 C-3.8,49 -3.8,52.2 -1.3,52.2" stroke="#5b646d" stroke-width=".8" fill="none"/>
      </g>`;
  }
  if (runner) {
    // sweatband with flapping ends, a drop of sweat, and a route-art heart tracing itself overhead
    extras += `
      <g clip-path="url(#${id}h)"><path d="M6,16.6 Q30,12.6 54,16.6 L54,20.8 Q30,16.8 6,20.8Z" fill="#f2611d"/><path d="M6,18.7 Q30,14.7 54,18.7" stroke="#ffffff" stroke-width=".7" fill="none" opacity=".7"/></g>
      <path class="ribbon-tail" d="M51.2,18.6 C55,17.4 57.4,19.2 60.4,18.4" stroke="#f2611d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="ribbon-tail ribbon-2" d="M51.2,20 C54.6,21.4 56.4,23.8 59.4,24.4" stroke="#d9520f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="sweat" d="M7,14.6 C5.6,17 5.6,18.8 7,18.8 C8.4,18.8 8.4,17 7,14.6Z" fill="#bfe3f2"/>
      <path class="route" pathLength="100" d="M30,-14.8 C25,-17.8 20.8,-21.6 22.6,-25.2 C24,-28 28,-28.2 30,-24.8 C32,-28.2 36,-28 37.4,-25.2 C39.2,-21.6 35,-17.8 30,-14.8Z" stroke="rgba(242,97,29,.35)" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="route" pathLength="100" d="M30,-14.8 C25,-17.8 20.8,-21.6 22.6,-25.2 C24,-28 28,-28.2 30,-24.8 C32,-28.2 36,-28 37.4,-25.2 C39.2,-21.6 35,-17.8 30,-14.8Z" stroke="#ff8a4c" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="30" cy="-14.8" r="1.4" fill="#ffffff"/><circle cx="30" cy="-14.8" r=".8" fill="#f2611d"/>`;
  }
  if (staff) {
    extras += `
      <path d="M52.5,86 C52,66 53.5,40 52.4,6" stroke="#6b4a2e" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M52.4,6 C52,-2 58,-5 60,0 C61.5,4 57,6 55.5,3" stroke="#6b4a2e" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M51.6,20 L51.8,34 M53.2,48 L53,60" stroke="#4a321f" stroke-width="1"/>
      <path d="M55.5,3 C52,1 49,2 47,5 C50,6 53,5.5 55.5,3Z" fill="#6f9c46"/>
      <path d="M58,4 C60,8 59,11 57,12.5 C56,10 56,7 58,4Z" fill="#87b05a"/>
      <ellipse cx="52.6" cy="56" rx="3.3" ry="3.5" fill="#c9ccc5"/>`;
  }

  return `<svg class="sp${relaxed ? ' relaxed' : ''}${runner ? ' runner' : ''}" viewBox="0 -14 60 104" aria-hidden="true">
    <defs>${headClip}${armor ? metal : ''}</defs>
    ${rager ? '' : '<ellipse cx="30" cy="88" rx="16" ry="2.4" fill="rgba(0,0,0,.3)"/>'}
    ${back}
    ${legs}
    ${body}
    <g class="ears">${antlers}${ears}</g>
    ${head}
    ${face}
    ${extras}
  </svg>`;
}
