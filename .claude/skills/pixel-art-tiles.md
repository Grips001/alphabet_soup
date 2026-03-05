# Skill: Pixel Art Tile Generation

Use when creating new tile assets (buildings, belts, items) to maintain visual consistency.

## Current Palette

- **Ground base**: `rgb(58-62, 73-78, 66-70)` — muted forest green, subtle 16px checkerboard
- **Background**: `#2e3d36` — dark green (visible if void somehow shows)
- **Grid lines**: black at 12% opacity

## Tile Specs

- Size: 32x32 pixels
- Format: PNG with RGBA
- Location: `public/assets/tiles/` (or `public/assets/{category}/`)
- Naming: kebab-case (e.g., `belt-horizontal.png`, `quarry-a.png`)

## Generation Method

Use Python + PIL (available on this system):

```python
python -c "
from PIL import Image
img = Image.new('RGBA', (32, 32))
for y in range(32):
    for x in range(32):
        img.putpixel((x, y), (r, g, b, 255))
img.save('public/assets/tiles/name.png')
"
```

## Visual Guidelines

- **Contrast against ground** — entities must be clearly visible on the green background
- **Clean shapes** — avoid noise/dither textures. Use flat colors with subtle shading.
- **Consistent lighting** — light source from top-left (brighter top/left edges)
- **Readability at 1x zoom** — details must be distinguishable at 32px display size
- **Direction indicators** — belts/inserters need clear directional cues (arrows, gradients)
- **State feedback** — active machines should differ visually from idle ones
