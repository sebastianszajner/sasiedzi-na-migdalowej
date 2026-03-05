#!/usr/bin/env python3
"""Generate room background images via Gemini Image API (Nano Banana)."""

import json
import base64
import sys
import os
import time
import urllib.request
import urllib.error

API_KEY = "AIzaSyAGUSrY8LhAIL7vI38Qt9FgD5YYLJaC5DE"
MODEL = "gemini-2.5-flash-image"  # Nano Banana — image generation model
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'rooms')

STYLE_ANCHOR = (
    "Cartoon illustrated side-view cross-section of a luxurious modern classic room interior, "
    "2D platformer game style, recently renovated Polish family home, Eichholtz Westwing aesthetic, "
    "brass gold accents, black window frames, black metal details, clean vector-like art with soft shadows, "
    "no outlines, edge to edge composition filling the entire canvas, no margins no border no padding, "
    "no characters no people no animals"
)

ROOMS = {
    "kuchnia": {
        "aspect": "5:4",
        "prompt": (
            "Polish family kitchen, wall color warm cream #F2EDE6. "
            "Black and brass kitchen: matte black kitchen cabinets with brass handles on bottom, "
            "white marble countertop with gray veining, black framed window with brass curtain rod "
            "and linen curtains showing blue sky, brass pendant lights hanging from ceiling. "
            "Left to right: tall matte black fridge, black cabinets with marble counter and brass faucet "
            "undermount sink, gas stove with brass knobs and copper pot, round marble-top table with "
            "black metal legs and black velvet chairs on right. "
            "Wall: floating brass shelf with glass jars, brass wall clock, white herringbone tile backsplash. "
            "Floor: light oak herringbone parquet. "
            "Solid background color, no transparency, no checkerboard pattern."
        )
    },
    "salon": {
        "aspect": "3:2",
        "prompt": (
            "Polish family living room, wall color warm beige #EDE8E0. "
            "Left to right: tall black metal and glass bookshelf with brass details and books on far left, "
            "deep emerald green velvet sofa with gold throw pillows center-left, brass and black marble "
            "coffee table center, large black framed TV on black metal TV console with brass legs right side, "
            "brass arc floor lamp next to sofa. "
            "Wall: large black framed window with black curtain rod and cream linen drapes showing garden, "
            "gallery wall with black and gold frames above sofa, brass wall sconces. "
            "Floor: dark oak herringbone parquet with cream and black geometric rug under coffee table. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "pokoj_kuby": {
        "aspect": "3:2",
        "prompt": (
            "Stylish modern classic boy bedroom for 7-year-old, wall color soft blue #E3EDF5. "
            "Luxurious but kid-friendly. Left to right: single bed with navy blue velvet headboard "
            "and white bedding with gold stars pattern on left, black metal desk with brass lamp "
            "and open book center, black metal bookshelf with colorful books and quality toys on right. "
            "Wall: large black framed window showing blue sky, framed space poster in black and gold frame, "
            "floating black shelf with LEGO models and plush dog, brass reading light above bed. "
            "Floor: light oak planks with soft navy and cream striped rug. "
            "Black toy chest with brass corners near bed. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "sypialnia": {
        "aspect": "3:4",
        "prompt": (
            "Luxurious modern classic master bedroom, wall color warm pink-beige #EDE5E0. "
            "Narrow vertical room. Large bed with tall tufted charcoal velvet headboard and white luxury "
            "bedding center, black and brass bedside tables on each side with brass table lamps with "
            "black shades, tall narrow black wardrobe with brass handles on right. "
            "Wall: black framed window with sheer white curtains and black curtain rod, "
            "framed abstract art in gold frame above bed, brass wall sconces flanking headboard. "
            "Floor: dark oak herringbone with cream faux fur rug beside bed. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "lazienka": {
        "aspect": "3:4",
        "prompt": (
            "Luxurious modern classic bathroom, wall color light mint-white #F0F0EC. "
            "Narrow vertical room. Freestanding white oval bathtub with brass faucet on left, "
            "black framed vanity mirror with brass shelf and white vessel sink on black marble vanity center, "
            "black fixtures throughout. "
            "Wall: large format white marble-look tiles, black framed window with frosted glass at top, "
            "brass shower head with black pipe fittings near bathtub, glass shelf with luxury bottles. "
            "Details: fluffy white towels on black towel rack with brass ends, small brass plant pot "
            "with green fern, brass soap dispenser. "
            "Floor: white hexagonal marble tiles with black grout. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "garaz": {
        "aspect": "9:10",
        "prompt": (
            "Modern organized luxury garage, wall color cool gray #E8E4E0. "
            "Clean minimalist garage with premium finishes. Dark gray SUV side view taking center, "
            "black metal industrial shelving with organized storage boxes on back wall, "
            "premium carbon road bicycle on black wall mount on right, black metal workbench "
            "with brass hardware on left. "
            "Wall: black metal pegboard with tools arranged neatly, small black framed window high on wall, "
            "modern black industrial pendant light, black metal garage door outline on right. "
            "Floor: polished gray epoxy concrete floor. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "przedsionek": {
        "aspect": "1:3",
        "prompt": (
            "Luxurious modern classic narrow entryway, wall color warm cream #F0EBE3. "
            "Very narrow vertical space. Black metal coat rack with brass hooks and hanging jackets "
            "on left wall, black metal console table with brass legs and marble top with brass key tray "
            "center, black framed mirror above console. "
            "Details: black metal umbrella stand, modern black shoe rack on floor, "
            "brass pendant light above, black and cream geometric doormat. "
            "Floor: light oak herringbone planks. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "hall": {
        "aspect": "4:5",
        "prompt": (
            "Luxurious modern classic upstairs landing, wall color warm beige #EDE8E0. "
            "Elegant hallway connecting rooms. Black metal staircase railing with brass handrail "
            "visible on left, black marble top console table with brass legs and vase with dried "
            "pampas grass center, gallery wall with 4-5 photos in matching black and gold frames. "
            "Wall: brass ceiling pendant light, black metal and glass balustrade, "
            "small fiddle leaf fig in black pot on brass plant stand. "
            "Floor: light oak herringbone parquet. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "zabka": {
        "aspect": "1:1",
        "prompt": (
            "Cartoon illustrated side-view cross-section of a modern Polish Zabka convenience store interior, "
            "2D platformer game style, clean vector-like art with soft shadows, no outlines, "
            "edge to edge composition filling the entire canvas, no margins no border no padding, "
            "no characters no people no animals. "
            "Wall color bright cream #F5F0EB. "
            "Metal shelving units on back wall with colorful products (chips, drinks, cans), "
            "glass door refrigerator on left with beverages and dairy, modern checkout counter "
            "with POS terminal on right, small promotional display with newspapers in front. "
            "Wall: green Zabka frog logo sign above shelves, modern LED strip lights on ceiling, "
            "price tags on shelves, small PROMOCJA sign. "
            "Floor: light gray modern linoleum tiles. "
            "Solid background, no transparency, no checkerboard."
        )
    },
    "antresola": {
        "aspect": "4:1",
        "prompt": (
            "Luxurious converted attic loft space, wall color dusty beige #D8D0C8. "
            "Very wide panoramic low room with visible black painted roof beams at top. "
            "Left to right: vintage leather trunk with brass corners on far left, "
            "organized black storage boxes stacked center-left, black metal reading lamp "
            "and velvet upholstered armchair center, black metal bookshelf with vintage books "
            "center-right, stacked premium leather suitcases on far right. "
            "Ceiling: exposed roof beams painted black, single round black framed porthole window, "
            "brass Edison bulb pendant hanging from beam. "
            "Floor: aged oak wide planks. "
            "Solid background, no transparency, no checkerboard."
        )
    },
}


def generate_room(name, config):
    """Generate a single room image via Gemini API."""
    # For zabka, use its own style (not luxury home)
    if name == "zabka":
        full_prompt = config["prompt"]
    else:
        full_prompt = f"{STYLE_ANCHOR}\n\n{config['prompt']}"

    body = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        }
    }

    url = f"{ENDPOINT}?key={API_KEY}"
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else ''
        print(f"  [ERROR] HTTP {e.code}: {error_body[:300]}")
        return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

    # Extract image from response
    candidates = result.get("candidates", [])
    for candidate in candidates:
        content = candidate.get("content", {})
        parts = content.get("parts", [])
        for part in parts:
            inline_data = part.get("inlineData", {})
            if inline_data.get("mimeType", "").startswith("image/"):
                img_bytes = base64.b64decode(inline_data["data"])
                output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
                with open(output_path, 'wb') as f:
                    f.write(img_bytes)
                size_kb = len(img_bytes) // 1024
                print(f"  Saved: {output_path} ({size_kb}KB)")
                return True

    print(f"  [ERROR] No image in response. Response keys: {list(result.keys())}")
    if candidates:
        print(f"  Parts: {[list(p.keys()) for p in candidates[0].get('content', {}).get('parts', [])]}")
    return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate specific rooms or all
    rooms_to_generate = sys.argv[1:] if len(sys.argv) > 1 else list(ROOMS.keys())

    print(f"=== Generating {len(rooms_to_generate)} room(s) via Gemini API ===\n")

    success = 0
    for name in rooms_to_generate:
        if name not in ROOMS:
            print(f"[SKIP] Unknown room: {name}")
            continue

        print(f"Generating: {name} (aspect {ROOMS[name]['aspect']})...")
        if generate_room(name, ROOMS[name]):
            success += 1
        else:
            print(f"  FAILED — retrying in 5s...")
            time.sleep(5)
            if generate_room(name, ROOMS[name]):
                success += 1

        # Rate limiting
        time.sleep(2)

    print(f"\nDone: {success}/{len(rooms_to_generate)} rooms generated.")


if __name__ == '__main__':
    main()
