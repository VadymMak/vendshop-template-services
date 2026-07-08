import Image from 'next/image';
import { GALLERY_IMAGES } from '@/lib/constants';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { BLUR_PLACEHOLDER } from '@/components/ui/BlurImage';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface GallerySectionProps {
  images?: GalleryImage[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const items = images && images.length > 0
    ? images
    : GALLERY_IMAGES.map((g, i) => ({ id: String(i), url: g.src, alt: g.alt }));

  return (
    <section id="galeria" className="gallery">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Naša práca</p>
        <h2 className="section-title">Galéria</h2>
        <GoldDivider />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={150}>
        <div className="gallery-grid">
          {items.map((image, index) => (
            <div key={image.id} className="gallery-item">
              {image.url ? (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="gallery-img"
                  priority={index === 0}
                  unoptimized={image.url.startsWith('http')}
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              ) : (
                <div className="gallery-img-placeholder" />
              )}
              <div className="gallery-overlay" />
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
