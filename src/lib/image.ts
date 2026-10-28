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
