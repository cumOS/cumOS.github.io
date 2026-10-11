# KamiOS website

The site of KamiOS, served by GitHub Pages: static files, no framework, no build step for the front page.

| File | What |
|---|---|
| `index.html`, `style.css`, `main.js` | the front page (the mask, the glitches, the three fragments) |
| `module_guide.md` | **the module guide**, the only source of the guide. Edit this one. |
| `modules.html` | the guide as a page, generated from `module_guide.md`. Do not edit by hand. |
| `doc.css`, `doc.js` | the look of the guide page (on top of `style.css`) |
| `build.py` | turns `module_guide.md` into `modules.html` (Python 3, no packages) |

## Changing the guide

```
$EDITOR module_guide.md
python3 build.py
git add module_guide.md modules.html && git commit && git push
```

`build.py` understands the Markdown the guide uses: headings (they get anchors, the contents list links to them), paragraphs,
lists with code blocks inside, tables, fenced code, `code`, **bold**, *italic* and links. If you need more, extend it there
rather than pasting HTML into the output.

## Looking at it

Open `index.html` in a browser, or `python3 -m http.server` in this folder. The front page hides its text until you scroll to
it; with `prefers-reduced-motion` the effects are off.

## About

KamiOS is built on crDroid and LineageOS. Public builds are not out yet.
Telegram: <https://t.me/kamiosofficial>
