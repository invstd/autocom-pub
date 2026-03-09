# Custom fonts (Autocom Dark)

Place your font files here. They are copied to `dist/assets/fonts/` on build.

## Expected filenames

**Work Sans** (body text) — woff2 + woff:

- `WorkSans-Regular.woff2` / `.woff` (400)
- `WorkSans-Medium.woff2` / `.woff` (500)
- `WorkSans-SemiBold.woff2` / `.woff` (600)
- `WorkSans-Bold.woff2` / `.woff` (700)

**Fabrikat** (headlines) — OTF only:

- `Fabrikat.otf` (400 Regular)
- `Fabrikat-Bold.otf` (700)
- `Fabrikat-Black.otf` (900; use with `font-black` for heaviest headlines)

For “extra bold cond caps” style, use `font-headline font-black uppercase` (Fabrikat-Black + caps).

Defined in `src/assets/styles/main.css`; applied when `data-theme="Autocom"` is set on `<html>`.
