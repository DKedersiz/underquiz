# underquiz logo generator

The scripts in this folder regenerate every SVG in `design/logo/` and `preview.html`. The output is plain SVG: all text is converted to paths, and there are no external references.

## Requirements

- Node.js 18 or newer. There are no npm dependencies, so you don't need `npm install`.
- Python 3.10 or newer, with the packages in `requirements.txt` (`fonttools` and `uharfbuzz`):

  ```sh
  python -m venv .venv
  .venv/Scripts/python -m pip install -r requirements.txt   # Windows
  # .venv/bin/python -m pip install -r requirements.txt     # macOS/Linux
  ```

## Fonts (OFL, from github.com/google/fonts)

| File in `fonts/` | Source (variable font) | Instance |
|---|---|---|
| `Fr-400.ttf`, `Fr-600.ttf`, `Fr-800.ttf` (committed, about 73 KB each, with `OFL-Fraunces.txt`) | `ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` | opsz 72, SOFT 50, WONK 1, wght 400/600/800 |
| `EB-600.ttf` (not committed, about 500 KB) | `ofl/ebgaramond/EBGaramond[wght].ttf` | wght 600 |

Run `python make_fonts.py` to download the variable fonts (from `https://raw.githubusercontent.com/google/fonts/main/ofl/...`). It caches them in `fonts/_variable/` and cuts the static instances. Files that already exist are skipped. Pass `--force` to rebuild them.

The static instances are needed because HarfBuzz and fontTools give correct advances and outlines for a fixed instance. opentype.js renders variable-font spacing wrongly.

## Regenerate

```sh
# from design/logo/src
PYTHON=.venv/Scripts/python node build.js        # writes ../*.svg and ../preview.html
PYTHON=.venv/Scripts/python node build.js /tmp/x # or write to another folder
```

In PowerShell, set the variable first: `$env:PYTHON='.venv\Scripts\python.exe'; node build.js`. If `PYTHON` is not set, the script uses `python` (`python3` on macOS/Linux).

Optional visual check with headless Chrome: `node shot.js ../preview.html shot.png 1200 4200`. Set `CHROME` if Chrome is installed somewhere else.

## Files

- `build.js` builds all variants (A wordmarks, B seals, C lockup) and holds the colours and variant parameters.
- `wave.js` draws the breaking-wave underline: a tapered brush line that rises into a counter-clockwise curl with claw-like foam tips, plus the skip-ink gap around the `q` descender.
- `waveq.js` draws the question mark whose hook is the same wave crest. The seals use it.
- `lib.js` holds the brush-stroke engine (variable-width outline from a centreline, Catmull-Rom smoothing), spirals, a path point parser and the `shape()` bridge to Python.
- `shape.py` does HarfBuzz shaping and turns the glyph outlines into SVG path data (JSON on stdout).
- `preview.js` writes `preview.html`, showing each variant on the paper and night backgrounds at large size and at 64/32/16 px.
- `make_fonts.py` downloads the fonts and cuts the static instances.
- `shot.js` is an optional screenshot helper.

## Tweaking

- Wave shape: `WAVE` and `wordmark()` in `build.js` (`R` curl radius, `lift`, `asp`, `turn`, `clawAngles`, line widths `wLine`/`wMax`).
- Seal glyphs: `Q_FULL` (display version, with claws) and `Q_FAV` (favicon version, bold, no claws) in `build.js`.
- Stamp texture: `sealStamped()` (feTurbulence grain threshold and displacement scale) and the `roughShape()` edge amplitude.
- Palette: the `C` object (paper `#F2E8D5`, ink `#1E3557`, vermilion `#C0502E`, night `#14213A`, and `#D8653F` for vermilion on night).
