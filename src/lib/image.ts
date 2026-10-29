/**
 * Browser-side image preparation. The artist uploads one JPG, PNG or WebP;
 * we make two web-ready versions before anything leaves the browser:
 *   - full  : up to 2400px on the long edge, high quality, for artwork pages and the full-screen viewer
 *   - thumb : up to 900px on the long edge, for the gallery and the homepage
 * Orientation from the camera (EXIF) is applied, and colors are left untouched.
 */

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

const FULL_EDGE = 2400;
const THUMB_EDGE = 900;

export type ProcessedImage = {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  ext: 'webp' | 'jpg';
  contentType: 'image/webp' | 'image/jpeg';
};

function supportsWebpEncoding() {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  return c.toDataURL('image/webp').startsWith('data:image/webp');
}

function scaled(bitmap: ImageBitmap, maxEdge: number, flattenOnPaper: boolean) {
  const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process images.');
  if (flattenOnPaper) {
    ctx.fillStyle = '#f7f6f2';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), type, quality);
  });
}

export type CropRect = { x: number; y: number; w: number; h: number; rotation?: number }; // 0–1 fractions; rotation in degrees

export type ProcessedPhotoPair = {
  cropped: Blob;
  croppedThumb: Blob;
  original: Blob;
  croppedWidth: number;
  croppedHeight: number;
  ext: 'webp' | 'jpg';
  contentType: 'image/webp' | 'image/jpeg';
};

/** Process a photo into a cropped artwork version + full original. */
export async function processPhotoPair(file: File, crop: CropRect): Promise<ProcessedPhotoPair> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is larger than 30 MB.');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const webp = supportsWebpEncoding();
    const type = webp ? 'image/webp' : 'image/jpeg';

    // Original: full image up to FULL_EDGE (no rotation, no crop — raw photo)
    const origCanvas = scaled(bitmap, FULL_EDGE, !webp);
    const original = await toBlob(origCanvas, type, 0.9);

    // Rotate the bitmap if needed before cropping
    const rotationDeg = crop.rotation ?? 0;
    let sourceCanvas: HTMLCanvasElement;
    if (rotationDeg !== 0) {
      const rad = rotationDeg * Math.PI / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const rw = Math.round(bitmap.width * cos + bitmap.height * sin);
      const rh = Math.round(bitmap.width * sin + bitmap.height * cos);
      const rc = document.createElement('canvas');
      rc.width = rw; rc.height = rh;
      const rctx = rc.getContext('2d')!;
      rctx.imageSmoothingEnabled = true; rctx.imageSmoothingQuality = 'high';
      rctx.translate(rw / 2, rh / 2);
      rctx.rotate(rad);
      rctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
      sourceCanvas = rc;
    } else {
      // No rotation: draw bitmap to a plain canvas so we can use drawImage consistently
      const pc = document.createElement('canvas');
      pc.width = bitmap.width; pc.height = bitmap.height;
      const pctx = pc.getContext('2d')!;
      pctx.drawImage(bitmap, 0, 0);
      sourceCanvas = pc;
    }

    // Apply crop rect to the (possibly rotated) source
    const sx = Math.round(sourceCanvas.width * crop.x);
    const sy = Math.round(sourceCanvas.height * crop.y);
    const sw = Math.max(1, Math.round(sourceCanvas.width * crop.w));
    const sh = Math.max(1, Math.round(sourceCanvas.height * crop.h));
    const ratio = Math.min(1, FULL_EDGE / Math.max(sw, sh));
    const cw = Math.max(1, Math.round(sw * ratio));
    const ch = Math.max(1, Math.round(sh * ratio));
    const cc = document.createElement('canvas');
    cc.width = cw; cc.height = ch;
    const ctx = cc.getContext('2d')!;
    if (!webp) { ctx.fillStyle = '#f7f6f2'; ctx.fillRect(0, 0, cw, ch); }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, cw, ch);
    const cropped = await toBlob(cc, type, 0.9);

    // Thumbnail from cropped
    const tr = Math.min(1, THUMB_EDGE / Math.max(cw, ch));
    const tw = Math.max(1, Math.round(cw * tr));
    const th = Math.max(1, Math.round(ch * tr));
    const tc = document.createElement('canvas');
    tc.width = tw; tc.height = th;
    const tctx = tc.getContext('2d')!;
    if (!webp) { tctx.fillStyle = '#f7f6f2'; tctx.fillRect(0, 0, tw, th); }
    tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(cc, 0, 0, cw, ch, 0, 0, tw, th);
    const croppedThumb = await toBlob(tc, type, 0.82);

    return { cropped, croppedThumb, original, croppedWidth: cw, croppedHeight: ch, ext: webp ? 'webp' : 'jpg', contentType: type };
  } finally {
    bitmap.close();
  }
}

/** Four corners of the painting in the photo, each as a 0–1 fraction of the image dimensions. */
export type CropQuad = {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  bl: { x: number; y: number };
  br: { x: number; y: number };
};

/** Bilinear interpolation: normalized (u,v) → pixel coords on the pre-scaled source canvas. */
function bilinearPt(q: CropQuad, u: number, v: number, W: number, H: number): [number, number] {
  return [
    ((1-u)*(1-v)*q.tl.x + u*(1-v)*q.tr.x + (1-u)*v*q.bl.x + u*v*q.br.x) * W,
    ((1-u)*(1-v)*q.tl.y + u*(1-v)*q.tr.y + (1-u)*v*q.bl.y + u*v*q.br.y) * H,
  ];
}

/**
 * Map a source triangle (src coords) onto a destination triangle (dst canvas coords)
 * using an affine transform, clipping to the destination triangle.
 * Source → dest mapping:  dst.x = a*sx + c*sy + e,  dst.y = b*sx + d*sy + f
 */
function warpTriangle(
  ctx: CanvasRenderingContext2D, src: HTMLCanvasElement,
  sx0: number, sy0: number, sx1: number, sy1: number, sx2: number, sy2: number,
  dx0: number, dy0: number, dx1: number, dy1: number, dx2: number, dy2: number,
) {
  const dsx1 = sx1-sx0, dsy1 = sy1-sy0, dsx2 = sx2-sx0, dsy2 = sy2-sy0;
  const ddx1 = dx1-dx0, ddy1 = dy1-dy0, ddx2 = dx2-dx0, ddy2 = dy2-dy0;
  const det = dsx1*dsy2 - dsx2*dsy1;
  if (Math.abs(det) < 0.5) return;
  const a = (dsy2*ddx1 - dsy1*ddx2) / det;
  const b = (dsy2*ddy1 - dsy1*ddy2) / det;
  const c = (dsx1*ddx2 - dsx2*ddx1) / det;
  const d = (dsx1*ddy2 - dsx2*ddy1) / det;
  const e = dx0 - a*sx0 - c*sy0;
  const f = dy0 - b*sx0 - d*sy0;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0); ctx.lineTo(dx1, dy1); ctx.lineTo(dx2, dy2); ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

/** Process a photo by de-warping the quad to a rectangle + keeping the full original. */
export async function processPhotoPerspective(file: File, quad: CropQuad): Promise<ProcessedPhotoPair> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is larger than 30 MB.');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const webp = supportsWebpEncoding();
    const type = webp ? 'image/webp' : 'image/jpeg';
    const bW = bitmap.width, bH = bitmap.height;

    // Original: full image, no correction
    const origCanvas = scaled(bitmap, FULL_EDGE, !webp);
    const original = await toBlob(origCanvas, type, 0.9);

    // Pre-scale source once for efficiency (2× output cap)
    const srcScale = Math.min(1, (FULL_EDGE * 2) / Math.max(bW, bH));
    const srcW = Math.max(1, Math.round(bW * srcScale));
    const srcH = Math.max(1, Math.round(bH * srcScale));
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = srcW; srcCanvas.height = srcH;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.imageSmoothingEnabled = true; srcCtx.imageSmoothingQuality = 'high';
    srcCtx.drawImage(bitmap, 0, 0, srcW, srcH);

    // Output dimensions from quad edge lengths in source image pixels
    const topEdge   = Math.hypot((quad.tr.x - quad.tl.x)*bW, (quad.tr.y - quad.tl.y)*bH);
    const botEdge   = Math.hypot((quad.br.x - quad.bl.x)*bW, (quad.br.y - quad.bl.y)*bH);
    const leftEdge  = Math.hypot((quad.bl.x - quad.tl.x)*bW, (quad.bl.y - quad.tl.y)*bH);
    const rightEdge = Math.hypot((quad.br.x - quad.tr.x)*bW, (quad.br.y - quad.tr.y)*bH);
    const rawW = Math.max(1, Math.round((topEdge + botEdge) / 2));
    const rawH = Math.max(1, Math.round((leftEdge + rightEdge) / 2));
    const edgeRatio = Math.min(1, FULL_EDGE / Math.max(rawW, rawH));
    const cw = Math.max(1, Math.round(rawW * edgeRatio));
    const ch = Math.max(1, Math.round(rawH * edgeRatio));

    const cc = document.createElement('canvas');
    cc.width = cw; cc.height = ch;
    const ctx = cc.getContext('2d')!;
    if (!webp) { ctx.fillStyle = '#f7f6f2'; ctx.fillRect(0, 0, cw, ch); }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    // Grid-subdivision perspective warp (24×24 gives sub-pixel accuracy for desk photos)
    const N = 24;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const u0 = i/N, u1 = (i+1)/N, v0 = j/N, v1 = (j+1)/N;
        const [s00x, s00y] = bilinearPt(quad, u0, v0, srcW, srcH);
        const [s10x, s10y] = bilinearPt(quad, u1, v0, srcW, srcH);
        const [s01x, s01y] = bilinearPt(quad, u0, v1, srcW, srcH);
        const [s11x, s11y] = bilinearPt(quad, u1, v1, srcW, srcH);
        const d00x = u0*cw, d00y = v0*ch, d10x = u1*cw, d10y = v0*ch;
        const d01x = u0*cw, d01y = v1*ch, d11x = u1*cw, d11y = v1*ch;
        warpTriangle(ctx, srcCanvas, s00x, s00y, s10x, s10y, s01x, s01y, d00x, d00y, d10x, d10y, d01x, d01y);
        warpTriangle(ctx, srcCanvas, s10x, s10y, s11x, s11y, s01x, s01y, d10x, d10y, d11x, d11y, d01x, d01y);
      }
    }
    const cropped = await toBlob(cc, type, 0.9);

    // Thumbnail from warped result
    const tr = Math.min(1, THUMB_EDGE / Math.max(cw, ch));
    const tw = Math.max(1, Math.round(cw * tr));
    const th = Math.max(1, Math.round(ch * tr));
    const tc = document.createElement('canvas');
    tc.width = tw; tc.height = th;
    const tctx = tc.getContext('2d')!;
    if (!webp) { tctx.fillStyle = '#f7f6f2'; tctx.fillRect(0, 0, tw, th); }
    tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(cc, 0, 0, cw, ch, 0, 0, tw, th);
    const croppedThumb = await toBlob(tc, type, 0.82);

    return { cropped, croppedThumb, original, croppedWidth: cw, croppedHeight: ch, ext: webp ? 'webp' : 'jpg', contentType: type };
  } finally {
    bitmap.close();
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is larger than 30 MB. Please choose a smaller image.');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const webp = supportsWebpEncoding();
    const contentType = webp ? 'image/webp' : 'image/jpeg';
    const fullCanvas = scaled(bitmap, FULL_EDGE, !webp);
    const thumbCanvas = scaled(bitmap, THUMB_EDGE, !webp);
    const [full, thumb] = await Promise.all([
      toBlob(fullCanvas, contentType, 0.9),
      toBlob(thumbCanvas, contentType, 0.82),
    ]);
    return {
      full,
      thumb,
      width: fullCanvas.width,
      height: fullCanvas.height,
      ext: webp ? 'webp' : 'jpg',
      contentType,
    };
  } finally {
    bitmap.close();
  }
}
