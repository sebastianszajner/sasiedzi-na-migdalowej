// ==========================================
// Face Portrait System
// Loads silhouette face images from public/faces/
// Each face has transparent bg + natural head contour
// ==========================================

export interface FaceImage {
  id: string;
  img: HTMLImageElement;
  loaded: boolean;
}

// Face registry — maps character ID to face image
const faceCache: Map<string, FaceImage> = new Map();

// Characters that should have face images
const FACE_IDS = ['kuba', 'mama', 'tata', 'rafal', 'listonosz', 'franek', 'kot', 'babcia_basia', 'dziadek_tadzio', 'babcia_ewa', 'dziadek_slawek'] as const;

// NPC id → face file mapping (some NPCs have different IDs than face files)
const NPC_FACE_MAP: Record<string, string> = {
  mama: 'mama',
  tata: 'tata',
  franek: 'franek',
  kot: 'kot',
  listonosz: 'listonosz',
  rafal: 'rafal',
  jurek_npc: 'franek', // Jurek (plush dog) uses Franek's face
  babcia_basia: 'babcia_basia',
  dziadek_tadzio: 'dziadek_tadzio',
  babcia: 'babcia_basia',   // alias
  dziadek: 'dziadek_tadzio', // alias
  babcia_ewa: 'babcia_ewa',
  dziadek_slawek: 'dziadek_slawek',
};

let _initialized = false;

/**
 * Pre-load all face images. Call once at game start.
 * Missing images are silently ignored (fallback to drawn faces).
 */
export function initFaces(): void {
  if (_initialized) return;
  _initialized = true;

  for (const id of FACE_IDS) {
    const img = new Image();
    const face: FaceImage = { id, img, loaded: false };

    img.onload = () => {
      face.loaded = true;
    };
    img.onerror = () => {
      // Silently fail — character will use drawn face
      face.loaded = false;
    };

    // Try both PNG and JPG
    img.src = `${import.meta.env.BASE_URL}faces/${id}.png`;
    // Fallback to JPG after a delay
    setTimeout(() => {
      if (!face.loaded) {
        const jpgImg = new Image();
        jpgImg.onload = () => {
          face.img = jpgImg;
          face.loaded = true;
        };
        jpgImg.src = `${import.meta.env.BASE_URL}faces/${id}.jpg`;
      }
    }, 1000);

    faceCache.set(id, face);
  }
}

/**
 * Get face image for a character (player or NPC).
 * Returns null if image not loaded or not available.
 */
export function getFace(characterId: string): HTMLImageElement | null {
  // Map NPC IDs to face file names
  const faceId = NPC_FACE_MAP[characterId] || characterId;
  const face = faceCache.get(faceId);
  if (face && face.loaded) return face.img;
  return null;
}

/**
 * Draw a circular face portrait on canvas.
 * Used both on character sprites and in dialog bubbles.
 */
export function drawFaceCircle(
  ctx: CanvasRenderingContext2D,
  characterId: string,
  cx: number,
  cy: number,
  radius: number,
  borderColor: string = '#5D4037',
  borderWidth: number = 2,
): boolean {
  const img = getFace(characterId);
  if (!img) return false; // no face available — caller should draw default

  ctx.save();

  // Clip to circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw face image centered and cropped to circle
  const size = radius * 2;
  ctx.drawImage(img, cx - radius, cy - radius, size, size);

  ctx.restore();

  // Border ring
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  return true;
}

/**
 * Draw a dialog portrait (larger, with name label).
 * Returns width consumed so dialog text can offset.
 */
export function drawDialogPortrait(
  ctx: CanvasRenderingContext2D,
  characterId: string,
  x: number,
  y: number,
  size: number = 60,
): boolean {
  return drawFaceCircle(ctx, characterId, x + size / 2, y + size / 2, size / 2, '#8D6E63', 3);
}

/**
 * Check if any faces are loaded (to know if system is active)
 */
export function hasFaces(): boolean {
  for (const face of faceCache.values()) {
    if (face.loaded) return true;
  }
  return false;
}
