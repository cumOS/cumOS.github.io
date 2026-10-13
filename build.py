#!/usr/bin/env python3
"""Builds modules.html from module_guide.md (the only source of the guide) and knobs.json.

    python3 build.py

No dependencies. It understands the part of Markdown the guide uses: headings, paragraphs,
lists (with code blocks inside), tables, fenced code, `code`, **bold**, *italic*, links and
blockquotes ("> [!warn]" / "> [!note]"). Two things are not plain Markdown, both written as HTML comments so the
raw file still reads well:

    <!-- group: Name -->     the sidebar group of the tabs that follow
    <!-- demo: name -->      a live example, filled in by demos.js
    <!-- lead -->            the paragraph after it is the introduction at the top of the page

Every "## " heading is a tab of the page, "### " and "#### " are the sections in it.
"""
import html
import json
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


USED_IDS = set()


def unique(ident):
    base = ident or "section"
    name, k = base, 2
    while name in USED_IDS:
        name = "%s-%d" % (base, k)
        k += 1
    USED_IDS.add(name)
    return name


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
        m = re.match(r"^<!--\s*demo:\s*([\w-]+)\s*-->\s*$", line)
        if m:
            name = m.group(1)
            note = ('The searchable list needs JavaScript. The same list is in <a href="knobs.json">knobs.json</a>.' if name == "knobs"
                    else "A live example is here; it needs JavaScript.")
            out.append('<div class="demo" data-demo="%s"><noscript><p>%s</p></noscript></div>' % (name, note))
            i += 1
            continue
        if re.match(r"^<!--.*-->\s*$", line):
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            # inside the page "###" is the heading of a section and "####" of a part of it
            level = {3: 2, 4: 3}.get(len(m.group(1)), len(m.group(1)))
            body = inline(m.group(2))
            ident = unique(slug(m.group(2)))
            out.append('<h%d id="%s"><a class="anchor" href="#%s">%s</a></h%d>' % (level, ident, ident, body, level))
            i += 1
            continue
        if line.startswith(">"):
            j = i
            quote = []
            while j < n and lines[j].startswith(">"):
                quote.append(lines[j][1:].lstrip())
                j += 1
            kind = "note"
            mk = re.match(r"^\[!(\w+)\]\s*$", quote[0]) if quote else None
            if mk:
                kind = mk.group(1).lower()
                quote = quote[1:]
            out.append('<aside class="callout %s">%s</aside>' % (kind, "".join(blocks(quote))))
            i = j
            continue
        if line.lstrip().startswith("|") and i + 1 < n and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = split_row(line)
            j = i + 2
            rows = []
            while j < n and lines[j].lstrip().startswith("|"):
                rows.append(split_row(lines[j]))
                j += 1
            t = ['<div class="tw stack"><table class="stack">']
            labels = [html.unescape(re.sub(r"<[^>]+>", "", inline(c))) for c in head]
            if any(head):
                t.append("<thead><tr>%s</tr></thead>" % "".join("<th>%s</th>" % inline(c) for c in head))
            t.append("<tbody>")
            for r in rows:
                t.append("<tr>%s</tr>" % "".join('<td%s>%s</td>' % (' data-label="%s"' % html.escape(labels[k], quote=True)
                                                              if k < len(labels) and labels[k] else "", inline(c)) for k, c in enumerate(r)))
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
        while j < n and lines[j].strip() and not re.match(r"^(```|#{1,6}\s|\||>|<!--)", lines[j]) and not LIST_RE.match(lines[j]):
            para.append(lines[j].strip())
            j += 1
        out.append("<p>%s</p>" % inline(" ".join(para)))
        i = j
    return out


KNOBS = HERE / "knobs.json"

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 142'%3E%3Cpath fill='%23e8e6e3' "
           "fill-rule='evenodd' d='M50 4.6C75 4.6 95.4 28 95.4 62C95.4 100 78 137 50 137C22 137 4.6 100 4.6 62C4.6 28 25 4.6 50 4.6Z "
           "M22.6 28.7C27 33 28.5 42 27.5 50C26 53 18.5 53 16.2 49.5C15 42 17.5 33 22.6 28.7Z M77.4 28.7C73 33 71.5 42 72.5 50C74 53 "
           "81.5 53 83.8 49.5C85 42 82.5 33 77.4 28.7Z'/%3E%3C/svg%3E")

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KamiOS &middot; making modules</title>
<meta name="description" content="How to write a KamiOS module: colours, shapes, pictures, fonts, sounds, animations, Settings and a Lua home screen, without a build or a signature.">
<meta name="theme-color" content="#060607">
<meta property="og:title" content="Making KamiOS modules">
<meta property="og:description" content="The whole manual for the Darkmoon theme engine, with live examples.">
<link rel="icon" href="@@FAVICON@@">
<script>document.documentElement.className+=" js";setTimeout(function(){if(!document.querySelector(".tab.active"))document.documentElement.classList.remove("js")},4000)</script>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="doc.css">
<link rel="stylesheet" href="demos.css">
</head>
<body class="doc">
<a class="skip" href="#stage">skip to the text</a>
<div class="glow" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<header class="bar">
  <button class="burger" id="burger" type="button" aria-label="Open the menu" aria-controls="side" aria-expanded="false"><span></span><span></span><span></span></button>
  <a class="brand" href="./"><b>KamiOS</b><i>modules</i></a>
  <span class="bar-title" id="bar-title" aria-live="polite"></span>
  <span class="bar-links"><a href="module_guide.md">raw markdown</a><a href="./">&larr; home</a></span>
</header>
<div class="scrim" id="scrim"></div>
<div class="shell">
  <nav class="side" id="side" aria-label="Guide">
    <div class="search">
      <input id="q" type="search" placeholder="search the guide" autocomplete="off" spellcheck="false" aria-label="Search the guide">
      <kbd>/</kbd>
    </div>
    <div class="results" id="results" hidden></div>
    <div class="tree" id="tree">
@@NAV@@
      <i class="ind" id="ind" aria-hidden="true"></i>
    </div>
  </nav>
  <main class="stage" id="stage">
@@TABS@@
  </main>
  <aside class="toc" id="toc" aria-label="On this page"></aside>
</div>
<footer>
  <span>KamiOS &middot; kept by KamiKaonashi</span>
  <span>built on crDroid and LineageOS, with thanks</span>
  <span class="visits"><span id="visit-count">&mdash;</span> visits</span>
</footer>
<script type="application/json" id="knobs-data">@@KNOBS@@</script>
<script src="counter.js"></script>
<script src="doc.js"></script>
<script src="demos.js"></script>
</body>
</html>
"""


def split_tabs(lines):
    """-> title, lead html, [tab dict]. A tab: id, title, group, body lines, summary."""
    title = "Making KamiOS modules"
    lead_lines = []
    tabs = []
    group = ""
    fence = False
    cur = None
    mode = "pre"
    for line in lines:
        if line.startswith("```"):
            fence = not fence
        if not fence:
            m = re.match(r"^<!--\s*group:\s*(.+?)\s*-->\s*$", line)
            if m:
                group = m.group(1)
                continue
            if re.match(r"^<!--\s*lead\s*-->\s*$", line):
                mode = "lead"
                continue
            m = re.match(r"^# (.*)$", line)
            if m and cur is None:
                title = m.group(1)
                continue
            m = re.match(r"^## (.*)$", line)
            if m:
                cur = {"title": m.group(1).strip(), "group": group, "body": []}
                tabs.append(cur)
                mode = "tab"
                continue
        if mode == "lead":
            lead_lines.append(line)
        elif mode == "tab":
            cur["body"].append(line)
    return title, "\n".join(lead_lines).strip(), tabs


def summary_of(body_lines):
    for ln in body_lines:
        t = ln.strip()
        if t and not t.startswith(("#", "<!--", "|", "-", "`", ">", "1.")):
            t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
            t = re.sub(r"[*`]", "", t)
            return t if len(t) < 150 else t[:147].rsplit(" ", 1)[0] + "..."
    return ""


def knobs_json():
    if not KNOBS.exists():
        return "[]"
    data = json.loads(KNOBS.read_text(encoding="utf-8"))
    rows = []
    for k in data.get("knobs", []):
        rows.append([k.get("target", ""), k.get("resource", ""), k.get("kind", ""), k.get("group", ""), k.get("title", ""),
                     k.get("description", ""), str(k.get("default", "")), 1 if k.get("untested") else 0])
    return json.dumps(rows, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def main():
    text = SRC.read_text(encoding="utf-8")
    title, lead, tabs = split_tabs(text.split("\n"))
    for t in tabs:
        t["id"] = unique(slug(t["title"]))
    nav, panes = [], []
    last_group = None
    for n, t in enumerate(tabs):
        if t["group"] != last_group:
            if last_group is not None:
                nav.append("      </div>")
            nav.append('      <div class="grp"><h2>%s</h2>' % html.escape(t["group"]))
            last_group = t["group"]
        label = t["title"].split(":")[0]
        nav.append('        <a class="item" href="#%s" data-tab="%s"><em>%02d</em><span>%s</span></a>'
                   % (t["id"], t["id"], n + 1, html.escape(label)))
    if last_group is not None:
        nav.append("      </div>")
    for n, t in enumerate(tabs):
        body = "".join(blocks(t["body"]))
        summary = summary_of(t["body"])
        prev_t = tabs[n - 1] if n else None
        next_t = tabs[n + 1] if n + 1 < len(tabs) else None
        pager = ['<nav class="pager" aria-label="Previous and next page">']
        pager.append('<a class="prev" href="#%s"><small>previous</small><span>%s</span></a>' % (prev_t["id"], html.escape(prev_t["title"].split(":")[0]))
                     if prev_t else "<span></span>")
        pager.append('<a class="next" href="#%s"><small>next</small><span>%s</span></a>' % (next_t["id"], html.escape(next_t["title"].split(":")[0]))
                     if next_t else "<span></span>")
        pager.append("</nav>")
        if n == 0:
            head = ('<header class="intro"><div class="aur" aria-hidden="true"><i></i><i></i><i></i></div>'
                    '<p class="kicker">the module guide</p><h1 class="tab-title">%s</h1><div class="lead">%s</div>'
                    '<p class="cta"><a class="btn" href="#try-it-in-five-minutes">try it in five minutes</a>'
                    '<a class="btn ghost" href="#knob-reference">every knob</a><a class="btn ghost" href="#the-module-store">module store</a></p></header>'
                    % (html.escape(title), "".join(blocks(lead.split("\n")))))
        else:
            head = '<h1 class="tab-title">%s</h1>' % inline(t["title"])
        panes.append('    <section class="tab%s" id="%s" data-title="%s" data-group="%s" data-summary="%s">\n%s\n%s\n%s\n    </section>'
                     % (" tab-start" if n == 0 else "", t["id"], html.escape(t["title"].split(":")[0], quote=True),
                        html.escape(t["group"], quote=True), html.escape(summary, quote=True), head, body, "".join(pager)))
    page = (PAGE.replace("@@FAVICON@@", FAVICON).replace("@@NAV@@", "\n".join(nav)).replace("@@TABS@@", "\n".join(panes))
            .replace("@@KNOBS@@", knobs_json()))
    OUT.write_text(page, encoding="utf-8")
    print("wrote %s (%d bytes, %d tabs)" % (OUT.name, OUT.stat().st_size, len(tabs)))


if __name__ == "__main__":
    sys.exit(main())
