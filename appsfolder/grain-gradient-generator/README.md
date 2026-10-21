# Grain Gradient Generator

A full-screen, grainy, lo-fi gradient made of blending colour blobs.

- Move the cursor (or drag on touch) to steer the gradient. After 3 seconds idle it drifts on its own.
- Click or tap anywhere (or press Space) for new random colours.
- Click a colour circle to copy its hex code. Use the padlock to keep a colour when re-rolling.
- Use the + circle above the swatches to add a colour (up to 7), and the × on a swatch to remove it (down to 2).
- The gear below the swatches opens the settings panel. Each setting has a fader and a number readout; typed values outside the range snap to the nearest limit.
- Drag the panel by its header (or focus the header and use the arrow keys). The page stays live behind it, and the panel takes its colours from the current gradient.
- Resize the panel from its bottom-right corner (or focus the corner and use the arrow keys). The whole panel scales up or down together.
- Turn on the Idle switch in the panel (or press I anywhere) to stop the blobs following the cursor. The gradient also goes idle while the cursor is over the panel.
- The arrow at the bottom of the tools column hides the swatches, settings and panel for a clean full-screen gradient. The small arrow at the right edge brings them back.
- Wander (in the Motion bank) sets how fast the idle drift moves, and Random sets how unpredictable the movement is, from a smooth repeating loop with steady orbits (0) to a meandering path with irregular orbits (1).
- The Shape bank controls the blobs: Blend (how much colours mix), Softness (defined to hazy edges) and Wobble (round to rippling outlines).

Open `gradient-index.html`. With GitHub Pages it's served at `/grain-gradient-generator/gradient-index.html`.

## Mark mode

The settings panel has two tabs. **Gradient** holds the original faders; **Marks** turns every grid cell into a graphic mark (switch it on there, or press M anywhere).

- Each cell's brightness picks one of the levels (or, with **By: Blob**, the nearest blob does) and sets how large its mark is drawn.
- Each level has a mark, a colour and its own size fader. Click a level's tile to pick a built-in shape or upload an SVG, PNG, JPEG or WebP (or drop an image onto the tile). Uploads are shrunk to 256px and are not saved between visits.
- The rainbow dot next to a level's colour uses the gradient's colour instead; **All gradient** does this for every level.
- Grid, size, tone and random-switch faders shape the pattern; **Dither** carries the grain over by mixing neighbouring levels.
- Reset on the Marks tab resets its faders and toggles but keeps your levels; **Restore** brings back the six built-in levels.

Mark replacement is inspired by [Ditherfy](https://antonburmistrov.com/tool-files/ditherfy/ditherfy-v.1.5.html) by Anton Burmistrov. This is an independent implementation.

## Adding and removing blobs

From the browser console, or from any future UI:

```js
grainGradient.addBlob();            // add a random colour (up to 7)
grainGradient.addBlob('#00ff88');   // add a specific colour
grainGradient.removeBlob();         // remove the last blob
grainGradient.removeBlob(1);        // remove the blob at index 1
```

The swatches update automatically. Defaults live in `CONFIG` and the fader ranges in `SETTINGS`, both at the top of `script.js`. Adding an entry to `SETTINGS` adds a fader; a new `bank` name adds a new bank.
