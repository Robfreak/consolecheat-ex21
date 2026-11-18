# Input-Overlay für Streams

Zeigt Tasten, Trigger und Sticks deines Controllers live als transparentes Overlay, zum Beispiel als Browserquelle in OBS. Teil der inoffiziellen consolecheat-Werkzeuge rund um [consolecheat.com](https://consolecheat.com). German is the primary language, English is the other. Light and dark theme (settings page only), self-hosted fonts, footer, Impressum, and Datenschutz are included.

No account, no tracking, nothing uploaded. Fonts (Outfit, Source Sans 3) are self-hosted from `@fontsource`, so the page makes no request to Google or any other third party. The Impressum fields are placeholders until the operator fills them in. No name or address was invented.

Site: <https://robfreak.github.io/consolecheat-ex21/>

Inoffiziell. Nicht von Sony.

## Two views

- **Settings page** (`https://robfreak.github.io/consolecheat-ex21/`): form controls, a live preview on a checkerboard (so transparent areas are visible), the generated overlay link, **Link kopieren** (with a read-only field as clipboard fallback), and **Overlay öffnen**.
- **Overlay view** (`#mode=overlay&…` in the hash, or `?overlay`): only the controller drawing. `html` and `body` are fully transparent, no header, no footer, no storage. It is chosen before the first paint by a small inline script in `index.html`.

## Add it to OBS (Browser Source / Browserquelle)

1. Open the settings page, pick skin, colours, size, and so on, then click **Link kopieren**.
2. In OBS: **Sources → + → Browser**.
3. Paste the link as **URL**.
4. Width and height: **480 × 300 × scale** (scale 1 → 480 × 300, 1.5 → 720 × 450, 2 → 960 × 600). The settings page shows the exact numbers.
5. No custom CSS is needed; the page background is already transparent. You can clear the OBS default CSS or leave it.
6. Press any button on the controller once while OBS is running. Browsers only expose a gamepad after a button press.

Example:

```
https://robfreak.github.io/consolecheat-ex21/#mode=overlay&skin=ps&accent=7eb6ff&base=1b2130&pressed=ff3366&scale=1&pad=auto&dz=0.1&sticks=1&triggers=1&opacity=1&lang=de
```

## Hash parameters

| Key | Values | Default |
| --- | --- | --- |
| `mode` | `overlay` (anything else, or none, is the settings page) | |
| `skin` | `ps` (PlayStation), `xbox` (Xbox), `retro` (Minimal/Retro) | `ps` |
| `accent`, `base`, `pressed` | hex colour, 3 or 6 digits, with or without `#` (`%23`) | `7eb6ff`, `1b2130`, `ff3366` |
| `scale` | 0.5–3 | 1 |
| `pad` | `auto` (first connected pad) or 0–3 (gamepad slot) | `auto` |
| `dz` | stick deadzone 0–0.9 | 0.1 |
| `sticks`, `triggers` | `1`/`0` (also `true`/`false`, `on`/`off`) | `1` |
| `opacity` | 0.1–1 | 1 |
| `demo` | `1` turns on the keyboard demo in the overlay | off |
| `hint` | `0` hides “Drücke eine Taste am Controller” while no pad is seen | on |
| `lang` | `de` or `en` (language of the hint) | `de` |

Parsing never throws: unknown keys are ignored, invalid values fall back to the default, numbers are clamped to the range and rounded to two decimals, colours must be valid hex.

## What is shown

- Every button of the standard mapping: face buttons, D-pad, L1/R1, L3/R3 (the stick circle fills when clicked), Share/Options, PS/Home, and the touchpad (PlayStation skin, only if the pad reports button 17).
- L2/R2 as analog bars filled 0..1 (`button.value`; digital triggers show 0 or 1).
- Both sticks as a dot in a circle. The deadzone is radial and drawn as a dashed inner ring. Inside it the dot stays centred; outside, the distance is rescaled so the edge of the deadzone is 0 and full tilt is 1. Diagonals beyond the unit circle are clamped.
- The pad is polled once per `requestAnimationFrame`. This is display only: the overlay shows the current state and no pad button triggers an action, so there is no first-poll rule to apply.

## Keyboard demo

For testing without a controller: arrow keys = D-pad, WASD = left stick, IJKL = right stick, Z/X/C/V = face buttons 0–3, Q/E = L1/R1, 1/3 = L2/R2 (full), F/H = L3/R3, N = Share, M = Options, P = PS/Home, T = touchpad. Keys go by their printed label. On the settings page the demo has its own switch (on by default for the preview). In the overlay it is off unless the hash has `demo=1`. The demo ignores keys while any form field has focus.

## Storage

- The overlay view reads and writes no storage.
- The settings page remembers the last configuration in `consolecheat-overlay-v1` (localStorage): `{ "schema": "consolecheat-overlay", "version": 1, "hash": "mode=overlay&…" }`, parsed with the same robust parser. Bad JSON, a foreign schema, or another version falls back to the defaults with a note. A settings URL with parameters in the hash wins over the saved value.
- `consolecheat-lang` and `consolecheat-theme` (localStorage, shared with the other consolecheat tools on robfreak.github.io)

The Datenschutz page names the key, says everything stays in the browser, cites Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs, and has a button that removes only `consolecheat-overlay-v1`.

## Run and test

```bash
npm install
npm test        # node --experimental-strip-types --test src/overlay/*.test.ts
npm run dev     # http://127.0.0.1:5173/consolecheat-ex21/
npm run build   # typecheck, Vite build (base /consolecheat-ex21/), offline check of dist/
npm run preview # http://127.0.0.1:4173/consolecheat-ex21/
```

Node `>=22.6` (`package.json` `engines`).

## Files

- `index.html`: the HTML entry (Vite input), including the early overlay/theme switch
- `src/overlay/`: React + TypeScript source, styles, and tests
  - `config.ts` (hash parse/serialize, defaults, clamping, hex), `pad.ts` (reading the pad, deadzone, triggers, pad selection), `skins.ts` (labels per skin), `demo.ts` (keyboard demo), `storage.ts`, `input.ts` (focus rules), `live.ts` (rAF polling hook)
  - `Overlay.tsx` (the SVG drawing), `OverlayView.tsx` (OBS view), `ConfigPage.tsx` (settings), `App.tsx`, `chrome.tsx`, `legal.tsx`, `messages.ts` (DE/EN)
  - `tools.ts` and `tool-links.tsx`: the footer list **Weitere Werkzeuge** (keep it identical across the consolecheat repos)
- `public/`: `favicon.svg`, `FONT-OFL.txt`, `.nojekyll`
- `scripts/check-dist.mjs`: offline check of `dist/` (no third-party hosts, no `.woff` fallback, woff2 fonts present)
- `.github/workflows/pages.yml`: test, build, and deploy to `gh-pages`

## Other tools

The footer group **Weitere Werkzeuge** (English: **Other tools**) links to the other consolecheat tools ex1 to ex20 at `https://robfreak.github.io/consolecheat-exN/`, including the [Spiele-Merkliste](https://robfreak.github.io/consolecheat-ex6/), [Retro-Banner-Generator](https://robfreak.github.io/consolecheat-ex19/), and [Backlog-Roulette](https://robfreak.github.io/consolecheat-ex20/). This tool (ex21) is left out of its own footer. These are ordinary links. The page does not request those sites.

## GitHub Pages

`.github/workflows/pages.yml` runs install, test, and build on pull requests and on every push. A push to `main` also pushes `dist/` to the orphan branch `gh-pages` (`peaceiris/actions-gh-pages`, Jekyll off). Vite `base` is `/consolecheat-ex21/`, which matches the project site <https://robfreak.github.io/consolecheat-ex21/>.

Enable once in the repository settings:

1. **Settings → Actions → General → Workflow permissions → Read and write permissions.** Save.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.** Branch: **`gh-pages`**, folder: **`/ (root)`.** Save.

After that, every push to `main` updates the site.

## Credits

Outfit and Source Sans 3 are bundled from `@fontsource` under the SIL Open Font License; see `public/FONT-OFL.txt` and `THIRD_PARTY_NOTICES.md`.

Replace the Impressum placeholders with the operator’s real details before treating that page as a legal notice.
