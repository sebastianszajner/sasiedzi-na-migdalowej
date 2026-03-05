#!/usr/bin/env python3
"""
process_asset.py — Pipeline do przetwarzania grafik z Nano Banana dla gry
"Sąsiedzi na Migdałowej".

Rozwiązuje 3 główne problemy grafik z AI:
1. Szachownica (checkerboard) baked-in jako piksele zamiast prawdziwej przezroczystości
2. Brak przezroczystości tam gdzie powinna być (faces, characters)
3. Za duży rozmiar pliku

Użycie:
    python3 scripts/process_asset.py room <plik.png> [--room NAZWA_POKOJU]
    python3 scripts/process_asset.py face <plik.png> [--output public/faces/NAME.png]
    python3 scripts/process_asset.py character <plik.png> [--output public/intro/characters.png]

Tryby:
    room       — pokój: usunięcie checkerboardu, compositing na kolor ściany, JPEG output
    face       — twarz postaci: rembg → przezroczyste tło, resize 256x256, PNG output
    character  — postać/intro: rembg → przezroczyste tło, PNG output
"""

from __future__ import annotations

import argparse
import sys
import os
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("BŁĄD: Brak PIL/numpy. Zainstaluj: pip3 install Pillow numpy")
    sys.exit(1)

# Kolory ścian pokojów (z level.ts)
ROOM_WALL_COLORS = {
    'zabka':       (0xF5, 0xF0, 0xEB),
    'garaz':       (0xE8, 0xE4, 0xE0),
    'przedsionek': (0xF0, 0xEB, 0xE3),
    'kuchnia':     (0xF2, 0xED, 0xE6),
    'salon':       (0xED, 0xE8, 0xE0),
    'gabinet':     (0xED, 0xE8, 0xE3),
    'pokoj_kuby':  (0xE3, 0xED, 0xF5),
    'hall':        (0xED, 0xE8, 0xE0),
    'lazienka':    (0xF0, 0xF0, 0xEC),
    'sypialnia':   (0xED, 0xE5, 0xE0),
    'antresola':   (0xD8, 0xD0, 0xC8),
}

# Aliasy nazw pokojów
ROOM_ALIASES = {
    'żabka': 'zabka', 'zabka': 'zabka',
    'garaż': 'garaz', 'garaz': 'garaz',
    'przedsionek': 'przedsionek',
    'kuchnia': 'kuchnia',
    'salon': 'salon',
    'gabinet': 'gabinet', 'gabinet_taty': 'gabinet', 'gabinet taty': 'gabinet',
    'pokój kuby': 'pokoj_kuby', 'pokoj_kuby': 'pokoj_kuby', 'pokój_kuby': 'pokoj_kuby',
    'hall': 'hall', 'korytarz': 'hall',
    'łazienka': 'lazienka', 'lazienka': 'lazienka',
    'sypialnia': 'sypialnia',
    'antresola': 'antresola', 'strych': 'antresola',
}


def detect_checkerboard(arr: np.ndarray) -> np.ndarray:
    """Detect checkerboard pixels baked into the image.

    Returns a boolean mask of pixels that are part of checkerboard pattern.
    Detects the classic AI-generated checkerboard: alternating light/dark gray squares
    with low color saturation.
    """
    r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
    brightness = (r + g + b) / 3.0
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = max_c - min_c

    # Checkerboard colors: light gray (180-215) and white (235-255), low saturation
    is_cb_white = (brightness > 235) & (sat < 15)
    is_cb_gray = (brightness > 130) & (brightness < 220) & (sat < 25)

    # Verify pattern: a CB pixel must have the OTHER type nearby (within ~20px)
    try:
        from scipy.ndimage import binary_dilation
        struct = np.ones((25, 25))
        white_near = binary_dilation(is_cb_white, struct)
        gray_near = binary_dilation(is_cb_gray, struct)
        confirmed = (is_cb_white & gray_near) | (is_cb_gray & white_near)
    except ImportError:
        # Without scipy: just use both masks (less precise but works)
        confirmed = is_cb_white | is_cb_gray

    return confirmed


def guess_room_from_filename(filename: str) -> str | None:
    """Try to guess room name from filename."""
    name = Path(filename).stem.lower()
    # Direct match
    for alias, room_key in ROOM_ALIASES.items():
        if alias in name:
            return room_key
    return None


def process_room(input_path: str, room_name: str | None, output_path: str | None) -> None:
    """Process a room background image: remove checkerboard, composite on wall color."""
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.uint8)

    # Determine wall color
    room_key = None
    if room_name:
        room_key = ROOM_ALIASES.get(room_name.lower())
    if not room_key:
        room_key = guess_room_from_filename(input_path)
    if not room_key:
        print(f"UWAGA: Nie rozpoznano pokoju. Dostępne: {', '.join(ROOM_WALL_COLORS.keys())}")
        print("Użyj --room NAZWA aby podać ręcznie. Domyślnie: #EDE8E0 (salon)")
        room_key = 'salon'

    wall_rgb = ROOM_WALL_COLORS[room_key]
    print(f"Pokój: {room_key} → kolor ściany: #{wall_rgb[0]:02X}{wall_rgb[1]:02X}{wall_rgb[2]:02X}")

    # Detect and replace checkerboard
    cb_mask = detect_checkerboard(arr)
    cb_count = np.sum(cb_mask)
    total = arr.shape[0] * arr.shape[1]

    if cb_count > 0:
        wall_color = np.array([wall_rgb[0], wall_rgb[1], wall_rgb[2], 255], dtype=np.uint8)
        arr[cb_mask] = wall_color
        print(f"Usunięto szachownicę: {cb_count} pikseli ({cb_count/total*100:.1f}%)")
    else:
        print("Brak szachownicy do usunięcia.")

    # Also handle true transparency → composite on wall color
    if img.mode == 'RGBA':
        alpha = arr[:,:,3]
        transparent = alpha < 255
        trans_count = np.sum(transparent)
        if trans_count > 0:
            # Composite transparent pixels on wall color
            a = alpha[transparent].astype(float) / 255.0
            for c in range(3):
                arr[transparent, c] = (arr[transparent, c].astype(float) * a +
                                       wall_rgb[c] * (1 - a)).astype(np.uint8)
            arr[transparent, 3] = 255
            print(f"Skomposytowano {trans_count} przezroczystych pikseli na kolor ściany.")

    # Determine output
    if not output_path:
        out_dir = Path(input_path).parent
        out_name = Path(input_path).stem + '.png'
        output_path = str(out_dir / out_name)

    out = Image.fromarray(arr[:,:,:3])  # Drop alpha — rooms don't need it

    # Save as PNG (game loads as room bg)
    out.save(output_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Zapisano: {output_path} ({out.size[0]}x{out.size[1]}, {size_kb:.0f}KB)")

    if size_kb > 500:
        print(f"UWAGA: Plik > 500KB. Rozważ zmniejszenie rozdzielczości.")


def process_face(input_path: str, output_path: str | None) -> None:
    """Process a face portrait: remove background, resize to 256x256."""
    try:
        from rembg import remove
    except ImportError:
        print("BŁĄD: Brak rembg. Zainstaluj: pip3 install rembg onnxruntime")
        sys.exit(1)

    img = Image.open(input_path)
    print(f"Input: {img.size[0]}x{img.size[1]} {img.mode}")

    # Remove background
    result = remove(img)

    # Resize to 256x256
    result = result.resize((256, 256), Image.LANCZOS)

    # Check transparency
    if result.mode == 'RGBA':
        pixels = np.array(result)
        trans = np.sum(pixels[:,:,3] < 128)
        total = pixels.shape[0] * pixels.shape[1]
        print(f"Przezroczystość: {trans/total*100:.1f}%")

    if not output_path:
        out_dir = Path(input_path).parent
        out_name = Path(input_path).stem + '.png'
        output_path = str(out_dir / out_name)

    result.save(output_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Zapisano: {output_path} (256x256, {size_kb:.0f}KB)")


def process_character(input_path: str, output_path: str | None, max_width: int = 1200) -> None:
    """Process a character/intro image: remove background, keep transparency."""
    try:
        from rembg import remove
    except ImportError:
        print("BŁĄD: Brak rembg. Zainstaluj: pip3 install rembg onnxruntime")
        sys.exit(1)

    img = Image.open(input_path)
    print(f"Input: {img.size[0]}x{img.size[1]} {img.mode}")

    # Remove background
    result = remove(img)

    # Resize if too wide
    if result.size[0] > max_width:
        ratio = max_width / result.size[0]
        new_h = int(result.size[1] * ratio)
        result = result.resize((max_width, new_h), Image.LANCZOS)
        print(f"Zmniejszono do {max_width}x{new_h}")

    if not output_path:
        out_dir = Path(input_path).parent
        out_name = Path(input_path).stem + '.png'
        output_path = str(out_dir / out_name)

    result.save(output_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Zapisano: {output_path} ({result.size[0]}x{result.size[1]}, {size_kb:.0f}KB)")


def main():
    parser = argparse.ArgumentParser(
        description='Przetwarzanie grafik z Nano Banana dla Sąsiedzi na Migdałowej',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Przykłady:
  python3 scripts/process_asset.py room ~/Downloads/kuchnia.png --room kuchnia
  python3 scripts/process_asset.py face ~/Downloads/babcia.png --output public/faces/babcia_basia.png
  python3 scripts/process_asset.py character ~/Downloads/family.png --output public/intro/characters.png

Pokoje: zabka, garaz, przedsionek, kuchnia, salon, gabinet, pokoj_kuby, hall, lazienka, sypialnia, antresola
        """
    )
    parser.add_argument('mode', choices=['room', 'face', 'character'],
                       help='Tryb: room (tło pokoju), face (twarz 256x256), character (postać z przezroczystością)')
    parser.add_argument('input', help='Ścieżka do pliku wejściowego')
    parser.add_argument('--room', '-r', help='Nazwa pokoju (dla trybu room)')
    parser.add_argument('--output', '-o', help='Ścieżka wyjściowa (domyślnie: nadpisuje input)')
    parser.add_argument('--max-width', type=int, default=1200, help='Maks. szerokość (tryb character)')

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"BŁĄD: Plik nie istnieje: {args.input}")
        sys.exit(1)

    print(f"=== process_asset.py | tryb: {args.mode} ===")
    print(f"Input: {args.input}")

    if args.mode == 'room':
        process_room(args.input, args.room, args.output)
    elif args.mode == 'face':
        process_face(args.input, args.output)
    elif args.mode == 'character':
        process_character(args.input, args.output, args.max_width)

    print("✓ Gotowe!")


if __name__ == '__main__':
    main()
