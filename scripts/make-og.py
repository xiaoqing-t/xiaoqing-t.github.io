"""Generate the homepage and per-note Open Graph cards (1200x630).

Usage: python scripts/make-og.py
Requires Pillow. Outputs public/og-image.png and public/og/note-*.png.
"""

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
NOTES = PUBLIC / "notes.json"

W, H = 1200, 630
INK = (33, 29, 25)
RUST = (168, 64, 39)
SOFT = (87, 80, 71)
LINE = (216, 203, 184)
WHITE = (255, 255, 255)

FONT_DIR = Path("C:/Windows/Fonts")
SEGOE = FONT_DIR / "segoeui.ttf"
SEGOE_BOLD = FONT_DIR / "segoeuib.ttf"
CONSOLAS = FONT_DIR / "consola.ttf"
CJK_BOLD = FONT_DIR / "msyhbd.ttc"

BOOK_LABELS = {
    "engineering": "ENGINEERING",
    "virtualization": "SYSTEM VIRTUALIZATION",
    "ml": "MACHINE LEARNING",
    "nlp": "NATURAL LANGUAGE PROCESSING",
    "theory": "COMPUTING THEORY",
}

CLOSING = set("，。：、；！？）」』】%")
OPENING = set("（「『【")
TOKEN = re.compile(r"[A-Za-z0-9][A-Za-z0-9./+:_-]*|\s+|.", re.S)


def font(path, size, index=0):
    return ImageFont.truetype(str(path), size, index=index)


def make_background():
    gradient = Image.linear_gradient("L").resize((W, H))
    bg = ImageOps.colorize(gradient, black=(246, 235, 224), white=(250, 247, 241))

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-350, -420, 760, 480), fill=(214, 150, 115, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(130))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow)
    return bg


def draw_tracked(draw, xy, text, fnt, fill, tracking=4):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking


def draw_mark(img, x, y, size, font_size):
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (x + 5, y + 7, x + size + 5, y + size + 7),
        radius=int(size * 0.2),
        fill=(80, 60, 40, 38),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(shadow)

    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        (x, y, x + size, y + size),
        radius=int(size * 0.2),
        fill=RUST,
    )
    draw.text(
        (x + size / 2, y + size / 2),
        "ZY",
        font=font(SEGOE_BOLD, font_size),
        fill=WHITE,
        anchor="mm",
    )


def wrap(text, fnt, max_width, draw):
    tokens = TOKEN.findall(text)
    lines = []
    line = ""
    for token in tokens:
        if token.isspace():
            if line and not line.endswith(" "):
                line += " "
            continue

        candidate = line + token
        if not line.strip() or draw.textlength(candidate.rstrip(), font=fnt) <= max_width:
            line = candidate
            continue

        if token in CLOSING:
            line = candidate
            lines.append(line.rstrip())
            line = ""
            continue

        trimmed = line.rstrip()
        while trimmed and trimmed[-1] in OPENING:
            token = trimmed[-1] + token
            trimmed = trimmed[:-1]
        lines.append(trimmed)
        line = token

    if line.strip():
        lines.append(line.rstrip())
    return [item.strip() for item in lines if item.strip()]


def wrap_balanced(text, fnt, max_width, draw):
    lines = wrap(text, fnt, max_width, draw)
    target = len(lines)
    if target <= 1:
        return lines

    best = lines
    lo, hi = 1, max_width
    while lo <= hi:
        mid = (lo + hi) // 2
        candidate = wrap(text, fnt, mid, draw)
        if len(candidate) == target:
            best = candidate
            hi = mid - 1
        else:
            lo = mid + 1
    return best


def split_title(title):
    for sep in ("：", ":"):
        if sep in title:
            left, right = title.split(sep, 1)
            if len(left) <= 16 and right.strip():
                return [left + sep, right.strip()]
    return None


def fit_title(title, draw):
    parts = split_title(title)
    for size in (70, 64, 58, 52):
        fnt = font(CJK_BOLD, size)
        if parts:
            lines = []
            for part in parts:
                lines.extend(wrap_balanced(part, fnt, 860, draw))
        else:
            lines = wrap_balanced(title, fnt, 860, draw)
        if len(lines) <= 3:
            return fnt, lines, size
    return fnt, lines, size


def build_main(base):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    draw_tracked(draw, (96, 120), "CS · BCI · BUILDING THINGS", font(SEGOE_BOLD, 22), RUST, tracking=4)

    name_font = font(SEGOE_BOLD, 104)
    draw.text((96, 170), "Zhao ", font=name_font, fill=INK)
    offset = draw.textlength("Zhao ", font=name_font)
    draw.text((96 + offset, 170), "Yunzhe", font=name_font, fill=RUST)

    subtitle = "Computer science · Brain-computer interfaces · Building things"
    sub_size = 32
    while sub_size > 22 and draw.textlength(subtitle, font=font(SEGOE, sub_size)) > 1000:
        sub_size -= 1
    draw.text((96, 336), subtitle, font=font(SEGOE, sub_size), fill=SOFT)

    draw.line((96, 500, 430, 500), fill=LINE, width=2)
    draw.text((96, 524), "xiaoqing-t.github.io", font=font(CONSOLAS, 22), fill=SOFT)

    draw_mark(img, 940, 84, 150, 56)
    return img


def build_note(base, title, kicker):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    draw_tracked(draw, (96, 96), kicker, font(SEGOE_BOLD, 21), RUST, tracking=4)

    title_font, lines, size = fit_title(title, draw)
    line_height = int(size * 1.3)
    for index, line in enumerate(lines):
        draw.text((96, 168 + index * line_height), line, font=title_font, fill=INK)

    draw.line((96, 506, 430, 506), fill=LINE, width=2)
    draw.text((96, 528), "xiaoqing-t.github.io", font=font(CONSOLAS, 22), fill=SOFT)

    draw_mark(img, 1020, 92, 96, 38)
    return img


def main():
    base = make_background()
    data = json.loads(NOTES.read_text(encoding="utf-8"))

    build_main(base).convert("RGB").save(PUBLIC / "og-image.png", optimize=True)

    out_dir = PUBLIC / "og"
    out_dir.mkdir(exist_ok=True)
    count = 0
    for book in data["books"]:
        label = BOOK_LABELS[book["id"]]
        for index, note in enumerate(book["notes"], start=1):
            kicker = f"{label} · NOTE {index:02d}"
            card = build_note(base, note["title"], kicker)
            card.convert("RGB").save(out_dir / note["href"].replace(".html", ".png"), optimize=True)
            count += 1

    print(f"[og] 写入 og-image.png + {count} 张笔记图（public/og/）")


if __name__ == "__main__":
    main()
