import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
}

export interface ImageVariant {
  suffix: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  fit?: 'inside' | 'cover' | 'contain' | 'fill' | 'outside';
}

export const GALLERY_VARIANTS: ImageVariant[] = [
  { suffix: '-full',  maxWidth: 1200, maxHeight: 800, quality: 82, fit: 'inside' },
  { suffix: '-thumb', maxWidth: 400,  maxHeight: 300, quality: 75, fit: 'inside' },
];

export const PRODUCT_VARIANTS: ImageVariant[] = [
  { suffix: '-main',  maxWidth: 600, maxHeight: 400, quality: 82, fit: 'cover' },
  { suffix: '-thumb', maxWidth: 300, maxHeight: 200, quality: 75, fit: 'cover' },
];

export async function processImage(
  inputBuffer: Buffer,
  variant: ImageVariant,
): Promise<ProcessedImage> {
  const result = await sharp(inputBuffer)
    .resize(variant.maxWidth, variant.maxHeight, {
      fit: variant.fit ?? 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: variant.quality })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    contentType: 'image/webp',
    width: result.info.width,
    height: result.info.height,
  };
}

export async function processImageVariants(
  inputBuffer: Buffer,
  variants: ImageVariant[],
): Promise<Array<{ suffix: string; processed: ProcessedImage }>> {
  return Promise.all(
    variants.map(async (variant) => ({
      suffix: variant.suffix,
      processed: await processImage(inputBuffer, variant),
    })),
  );
}

export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Непідтримуваний формат. Дозволено: JPEG, PNG, WebP, GIF, AVIF`;
  }
  if (file.size > MAX_SIZE) {
    return `Файл завеликий (макс. ${MAX_SIZE / 1024 / 1024}MB)`;
  }
  return null;
}
