#!/usr/bin/env python3
"""
crop_faces.py — Extract circular face portraits from raw character images.
Produces 128x128 pre-cropped circle PNGs ready for game sprites.

Uses skin color detection to find face center automatically,
with manual override coordinates per character for fine-tuning.
"""

from PIL import Image, ImageDraw
import numpy as np
import os
from scipy.ndimage import label, binary_dilation, binary_closing, binary_fill_holes

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "postacie_surowe")
OUT = os.path.join(BASE, "public", "faces")
OUTPUT_SIZE = 128

# Character configs
# For multi-person source images, crop_x defines horizontal slice (pct of image width)
# face_cx, face_cy, face_r are optional manual overrides in source pixel coords
CHARACTERS = {
    'kuba': {
        'source': 'Ola_KUBA_po porawej SEBA.png',
        'crop_x': (0.28, 0.70),  # center person
    },
    'mama': {
        'source': 'Ola_KUBA_po porawej SEBA.png',
        'crop_x': (0.0, 0.38),  # left person (Ola)
    },
    'tata': {
        'source': 'Ola_KUBA_po porawej SEBA.png',
        'crop_x': (0.62, 1.0),  # right person (Seba)
        'radius_boost': 1.4,  # boost radius to show more hair
    },
    'babcia_basia': {
        'source': 'Babcia Basia_mama_Seby_Image_yr37v6yr37v6yr37 (1).png',
    },
    'dziadek_tadzio': {
        'source': 'Dziadek Tadzio_ tato Seby_Generated_Image_yr37v6yr37v6yr37 (1).png',
    },
    'babcia_ewa': {
        'source': 'Babcia_Ewa_mama_Oli_dquvvndquvvndquv.png',
    },
    'dziadek_slawek': {
        'source': 'Dziadek Sławek_tata_Oli_ty8xopty8xopty8x.png',
    },
}


def detect_skin(arr):
    """Detect skin-colored pixels in RGB array."""
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    return (
        (r > 170) & (g > 110) & (g < 225) & (b > 70) & (b < 210) &
        (r > g) & (g > b) & ((r - b) > 15)
    )


def detect_not_background(arr):
    """Detect pixels that are NOT checkerboard/uniform gray background.

    Checkerboard from AI generators has alternating gray squares:
    light (~190-225, R≈G≈B) and dark (~110-160, R≈G≈B).
    """
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    sat = np.max(arr[:, :, :3], axis=2).astype(int) - np.min(arr[:, :, :3], axis=2).astype(int)
    brightness = (r + g + b) / 3.0
    # Background is uniform gray: low saturation, medium brightness
    # Use aggressive threshold to catch edge-blended checkerboard too
    is_bg = (sat < 20) & (brightness > 90) & (brightness < 240)
    return ~is_bg


def find_face_circle(arr, name=""):
    """Find optimal face circle (cx, cy, radius) in an image array.

    Strategy:
    1. Find non-background content bounding box
    2. Within top 50% of content, find skin pixels
    3. Use skin pixel centroid as face center
    4. Calculate radius from face skin extent
    """
    h, w = arr.shape[:2]

    # Step 1: find content bounding box
    content = detect_not_background(arr)
    content_ys, content_xs = np.where(content)
    if len(content_ys) == 0:
        print(f"  [{name}] WARNING: no content detected, using image center")
        return w // 2, h // 2, min(w, h) // 4

    content_top = int(np.percentile(content_ys, 2))
    content_bottom = int(np.percentile(content_ys, 98))
    content_left = int(np.percentile(content_xs, 2))
    content_right = int(np.percentile(content_xs, 98))
    content_h = content_bottom - content_top
    content_w = content_right - content_left
    print(f"  [{name}] Content box: ({content_left},{content_top})-({content_right},{content_bottom}) = {content_w}x{content_h}")

    # Step 2: find skin in upper 50% of content (face area, not chest)
    search_bottom = content_top + int(content_h * 0.50)
    upper_region = arr[content_top:search_bottom, content_left:content_right]
    skin = detect_skin(upper_region)
    skin_ys, skin_xs = np.where(skin)

    if len(skin_ys) < 100:
        print(f"  [{name}] WARNING: few skin pixels ({len(skin_ys)}), widening search")
        search_bottom = content_top + int(content_h * 0.65)
        upper_region = arr[content_top:search_bottom, content_left:content_right]
        skin = detect_skin(upper_region)
        skin_ys, skin_xs = np.where(skin)

    if len(skin_ys) < 10:
        print(f"  [{name}] WARNING: no skin detected, using content center")
        cx = (content_left + content_right) // 2
        cy = content_top + content_h // 3
        return cx, cy, content_h // 4

    # Map back to full image coords
    skin_ys_abs = skin_ys + content_top
    skin_xs_abs = skin_xs + content_left

    # Step 3: face center — use median of skin pixels (robust to outliers)
    face_cy = int(np.median(skin_ys_abs))
    face_cx = int(np.median(skin_xs_abs))
    print(f"  [{name}] Skin center: ({face_cx}, {face_cy})")

    # Step 4: radius — based on skin pixel spread
    # Use the vertical extent of skin in the face region
    skin_y_range = int(np.percentile(skin_ys_abs, 95)) - int(np.percentile(skin_ys_abs, 5))
    skin_x_range = int(np.percentile(skin_xs_abs, 95)) - int(np.percentile(skin_xs_abs, 5))
    face_size = max(skin_y_range, skin_x_range)

    # Radius should capture full face + hair margin
    # Face skin height is from forehead to chin — add ~40% for hair above
    radius = int(face_size * 0.70)

    # Shift center up slightly to show more hair top
    face_cy = face_cy - int(radius * 0.08)

    print(f"  [{name}] Face circle: center=({face_cx},{face_cy}), radius={radius}")
    return face_cx, face_cy, radius


def create_silhouette_portrait(arr, cx, cy, radius, output_size=128):
    """Extract face portrait in natural head silhouette shape.

    Returns RGBA PIL Image — character pixels opaque, background transparent.
    Each character gets their unique head contour (hair, ears, chin).
    """
    # Ensure crop stays within image bounds
    h, w = arr.shape[:2]
    pad = max(0, radius - cx, radius - cy, cx + radius - w, cy + radius - h) + 10
    if pad > 0:
        padded = np.full((h + 2 * pad, w + 2 * pad, arr.shape[2]), 200, dtype=np.uint8)
        padded[pad:pad + h, pad:pad + w] = arr
        arr = padded
        cx += pad
        cy += pad
        h, w = arr.shape[:2]

    # Crop square around face
    x1 = cx - radius
    y1 = cy - radius
    x2 = cx + radius
    y2 = cy + radius
    crop = arr[y1:y2, x1:x2, :3].copy()
    crop_h, crop_w = crop.shape[:2]

    # Detect character silhouette (colored pixels vs gray checkerboard)
    sat = np.max(crop, axis=2).astype(int) - np.min(crop, axis=2).astype(int)
    is_colored = sat >= 15

    # Morphological closing to bridge small gaps in character boundary
    close_struct = np.ones((7, 7), dtype=int)
    is_character = binary_closing(is_colored, structure=close_struct, iterations=3)

    # Fill interior holes (eyes, mouth shadow, white hair enclosed by character)
    is_character = binary_fill_holes(is_character)

    # Dilate slightly to include anti-aliased edge pixels
    is_character = binary_dilation(is_character, iterations=3)

    # Build RGBA output — character opaque, background transparent
    output = np.zeros((crop_h, crop_w, 4), dtype=np.uint8)
    output[is_character, 0] = crop[is_character, 0]
    output[is_character, 1] = crop[is_character, 1]
    output[is_character, 2] = crop[is_character, 2]
    output[is_character, 3] = 255

    # Anti-alias the silhouette edge: partially transparent border pixels
    # Erode the mask slightly, then blend the edge zone
    from scipy.ndimage import binary_erosion
    inner = binary_erosion(is_character, iterations=2)
    edge_zone = is_character & ~inner
    output[edge_zone, 3] = 180  # semi-transparent edge for smooth look

    # Resize to output size
    img = Image.fromarray(output, 'RGBA')
    img = img.resize((output_size, output_size), Image.LANCZOS)
    return img


def process_character(name, config):
    """Process a single character: extract face from source image."""
    source_path = os.path.join(SRC, config['source'])
    if not os.path.exists(source_path):
        print(f"  [{name}] ERROR: source not found: {source_path}")
        return False

    img = Image.open(source_path).convert('RGB')
    arr = np.array(img)

    # Horizontal crop for multi-person images
    if 'crop_x' in config:
        x_start = int(arr.shape[1] * config['crop_x'][0])
        x_end = int(arr.shape[1] * config['crop_x'][1])
        arr = arr[:, x_start:x_end]
        print(f"  [{name}] Horizontal crop: x={x_start}-{x_end} ({arr.shape[1]}px wide)")

    # Manual override or auto-detect
    if 'face_cx' in config:
        cx, cy, radius = config['face_cx'], config['face_cy'], config['face_r']
        print(f"  [{name}] Manual coords: center=({cx},{cy}), radius={radius}")
    else:
        cx, cy, radius = find_face_circle(arr, name)

    # Apply radius boost if specified
    if 'radius_boost' in config:
        radius = int(radius * config['radius_boost'])
        print(f"  [{name}] Radius boosted to {radius}")

    # Create silhouette portrait (transparent bg, natural head shape)
    portrait = create_silhouette_portrait(arr, cx, cy, radius, OUTPUT_SIZE)

    # Save
    output_path = os.path.join(OUT, f"{name}.png")
    portrait.save(output_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  [{name}] Saved: {output_path} ({OUTPUT_SIZE}x{OUTPUT_SIZE}, {size_kb:.0f}KB)")
    return True


def main():
    os.makedirs(OUT, exist_ok=True)
    print(f"=== crop_faces.py ===")
    print(f"Source: {SRC}")
    print(f"Output: {OUT} ({OUTPUT_SIZE}x{OUTPUT_SIZE})")
    print()

    success = 0
    for name, config in CHARACTERS.items():
        print(f"Processing: {name}")
        if process_character(name, config):
            success += 1
        print()

    print(f"Done: {success}/{len(CHARACTERS)} faces processed.")


if __name__ == '__main__':
    main()
