"""Render the After Hours share card with existing local branding.

Requires Pillow (also used by the resume preview).
Run: python3 scripts/build-social-card.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SIZE = (1200, 630)
FONT = ROOT / "public/fonts/space-grotesk-variable.ttf"

# Existing project-banner artwork; the opaque gradient keeps type readable.
image = ImageOps.fit(Image.open(ROOT / "public/assets/after-hours-city.webp").convert("RGB"), SIZE, centering=(0.68, 0.5)).convert("RGBA")
overlay = Image.new("RGBA", SIZE)
pixels = overlay.load()
for x in range(SIZE[0]):
    alpha = round(246 - 100 * (x / (SIZE[0] - 1)) ** 1.6)
    for y in range(SIZE[1]):
        pixels[x, y] = (11, 11, 15, alpha)
image = Image.alpha_composite(image, overlay)
draw = ImageDraw.Draw(image)

def label(value, xy, size, color, weight=500):
    font = ImageFont.truetype(str(FONT), size)
    font.set_variation_by_axes([weight])
    draw.text(xy, value, font=font, fill=color, anchor="lt")

draw.rounded_rectangle((72, 88, 120, 94), radius=3, fill="#ff8a3d")
label("RAJ KUMAR S", (72, 124), 28, "#ff8a3d", 600)
label("iOS Product", (68, 207), 88, "#f4f4f5", 650)
label("Engineer", (68, 302), 88, "#f4f4f5", 650)
label("Swift · UIKit · SwiftUI", (72, 426), 30, "#d4d4d8")
label("iamnyx.dev", (72, 524), 27, "#f4f4f5")
output = ROOT / "public/social-share.png"
image.convert("RGB").save(output, optimize=True)
print(f"{output} ({SIZE[0]}x{SIZE[1]})")
