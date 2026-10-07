#!/usr/bin/env python3
"""Compose the 1200x630 default share image from existing brand assets."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "brand" / "sunday-logo-gold.png"
OUT = ROOT / "public" / "og-image.png"

NAVY = (26, 36, 65, 255)
BLUE = (22, 74, 123, 255)
SKY = (47, 138, 192, 255)
WIDTH, HEIGHT = 1200, 630


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def main() -> None:
    img = Image.new("RGBA", (WIDTH, HEIGHT), NAVY)
    pixels = img.load()
    for y in range(HEIGHT):
        ty = y / (HEIGHT - 1)
        for x in range(WIDTH):
            tx = x / (WIDTH - 1)
            left = lerp(NAVY, BLUE, ty)
            right = lerp(BLUE, SKY, ty)
            pixels[x, y] = lerp(left, right, tx)

    logo = Image.open(LOGO).convert("RGBA")
    target_w = 560
    ratio = target_w / logo.width
    logo = logo.resize((target_w, int(logo.height * ratio)), Image.Resampling.LANCZOS)
    x = (WIDTH - logo.width) // 2
    y = (HEIGHT - logo.height) // 2
    img.alpha_composite(logo, (x, y))

    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
