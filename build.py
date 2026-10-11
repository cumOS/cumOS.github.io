#!/usr/bin/env python3
"""Builds modules.html from module_guide.md (the only source of the guide).

    python3 build.py

No dependencies. It understands the part of Markdown the guide uses: headings, paragraphs,
lists (with code blocks inside), tables, fenced code, `code`, **bold**, *italic* and links.
"""
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "module_guide.md"
OUT = HERE / "modules.html"


def slug(text):
    text = re.sub(r"<[^>]+>", "", text).lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"\s+", "-", text.strip())


def inline(text):
    spans = []

    def keep(m):
        spans.append("<code>%s</code>" % html.escape(m.group(1), quote=False))
        return "\0%d\0" % (len(spans) - 1)

    text = re.sub(r"`([^`]+)`", keep, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', text)
    return re.sub(r"\0(\d+)\0", lambda m: spans[int(m.group(1))], text)


LIST_RE = re.compile(r"^(\s*)([-*]|\d+\.)\s+(.*)$")


def split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def blocks(lines):
    out = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        m = re.match(r"^```(\w*)\s*$", line)
        if m:
            j = i + 1
            while j < n and not re.match(r"^```\s*$", lines[j]):
                j += 1
            code = html.escape("\n".join(lines[i + 1:j]), quote=False)
            lang = m.group(1)
            out.append('<pre><code%s>%s</code></pre>' % (' class="lang-%s"' % lang if lang else "", code))
            i = j + 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            body = inline(m.group(2))
            if level == 1:
                out.append("<h1>%s</h1>" % body)
            else:
                out.append('<h%d id="%s"><a class="anchor" href="#%s">%s</a></h%d>'
                           % (level, slug(m.group(2)), slug(m.group(2)), body, level))
            i += 1
            continue
        if line.lstrip().startswith("|") and i + 1 < n and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = split_row(line)
            j = i + 2
            rows = []
            while j < n and lines[j].lstrip().startswith("|"):
                rows.append(split_row(lines[j]))
                j += 1
            t = ['<div class="tw"><table>']
            if any(head):
                t.append("<thead><tr>%s</tr></thead>" % "".join("<th>%s</th>" % inline(c) for c in head))
            t.append("<tbody>")
            for r in rows:
                t.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r))
            t.append("</tbody></table></div>")
            out.append("".join(t))
            i = j
            continue
        m = LIST_RE.match(line)
        if m and not m.group(1):
            ordered = m.group(2)[0].isdigit()
            items = []
            j = i
            while j < n:
                mm = LIST_RE.match(lines[j])
                if not (mm and not mm.group(1)):
                    break
                width = len(lines[j]) - len(mm.group(3))
                body = [mm.group(3)]
                j += 1
                while j < n:
                    nxt = lines[j]
                    if not nxt.strip():
                        k = j
                        while k < n and not lines[k].strip():
                            k += 1
                        if k < n and (lines[k].startswith("  ") ):
                            body.extend([""] * (k - j))
                            j = k
                            continue
                        break
                    if nxt.startswith(" "):
                        body.append(nxt[width:] if nxt[:width].strip() == "" else nxt.lstrip())
                        j += 1
                        continue
                    break
                items.append(body)
            tag = "ol" if ordered else "ul"
            lis = []
            for body in items:
                inner = blocks(body)
                if len(inner) == 1 and inner[0].startswith("<p>") and inner[0].count("<p>") == 1:
                    inner = [inner[0][3:-4]]
                lis.append("<li>%s</li>" % "".join(inner))
            out.append("<%s>%s</%s>" % (tag, "".join(lis), tag))
            i = j
            continue
        para = [line.strip()]
        j = i + 1
        while j < n and lines[j].strip() and not re.match(r"^(```|#{1,6}\s|\|)", lines[j]) and not LIST_RE.match(lines[j]):
            para.append(lines[j].strip())
            j += 1
        out.append("<p>%s</p>" % inline(" ".join(para)))
        i = j
    return out


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KamiOS &middot; making modules</title>
<meta name="description" content="How to write a KamiOS module: colours, shapes, pictures, fonts, settings and a Lua home screen, without a build or a signature.">
<meta name="theme-color" content="#060607">
<meta property="og:title" content="Making KamiOS modules">
<meta property="og:description" content="The whole manual for the Darkmoon theme engine.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 142'%3E%3Cpath fill='%23e8e6e3' fill-rule='evenodd' d='M50 4.6C75 4.6 95.4 28 95.4 62C95.4 100 78 137 50 137C22 137 4.6 100 4.6 62C4.6 28 25 4.6 50 4.6Z M22.6 28.7C27 33 28.5 42 27.5 50C26 53 18.5 53 16.2 49.5C15 42 17.5 33 22.6 28.7Z M77.4 28.7C73 33 71.5 42 72.5 50C74 53 81.5 53 83.8 49.5C85 42 82.5 33 77.4 28.7Z'/%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="doc.css">
</head>
<body class="doc">
<div class="glow" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<header class="top">
  <a href="./">&larr; KamiOS</a>
  <a href="module_guide.md">raw markdown</a>
</header>
<article class="guide">
@@BODY@@
</article>
<footer>
  <span>KamiOS &middot; kept by KamiKaonashi</span>
  <span>built on crDroid and LineageOS, with thanks</span>
</footer>
<script src="doc.js"></script>
</body>
</html>
"""


def main():
    text = SRC.read_text(encoding="utf-8")
    body = "\n".join(blocks(text.split("\n")))
    OUT.write_text(PAGE.replace("@@BODY@@", body), encoding="utf-8")
    print("wrote %s (%d bytes)" % (OUT.name, OUT.stat().st_size))


if __name__ == "__main__":
    sys.exit(main())
