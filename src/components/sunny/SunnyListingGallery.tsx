import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './sunny-generative.css';

type SunnyListingGalleryProps = {
  images: readonly string[];
  title: string;
};

export function SunnyListingGallery({ images, title }: SunnyListingGalleryProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const goTo = useCallback(
    (next: number, behavior: ScrollBehavior = 'smooth') => {
      if (count === 0) return;
      const wrapped = (next + count) % count;
      setIndex(wrapped);
      const track = trackRef.current;
      if (track) {
        track.scrollTo({ left: wrapped * track.clientWidth, behavior });
      }
    },
    [count],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const width = track.clientWidth;
      if (!width) return;
      const next = Math.round(track.scrollLeft / width);
      setIndex(Math.min(Math.max(next, 0), Math.max(count - 1, 0)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center bg-[#1a2441] text-[#f5d15a]/80">
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">{t('sunnyChat.noPhoto')}</span>
      </div>
    );
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('sunnyChat.photoOf', { current: index + 1, total: count, title })}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(index - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(index + 1);
        }
      }}
    >
      <div ref={trackRef} className="sunny-gallery-track">
        {images.map((src, photoIndex) => (
          <div key={src} className="sunny-gallery-slide aspect-[16/9] bg-[#1a2441]">
            <img
              src={src}
              alt={t('sunnyChat.photoOf', { current: photoIndex + 1, total: count, title })}
              className="h-full w-full object-cover"
              loading={photoIndex === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a2441]/80 text-white hover:bg-[#1a2441]"
            onClick={() => goTo(index - 1)}
            aria-label={t('sunnyChat.previousPhoto')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a2441]/80 text-white hover:bg-[#1a2441]"
            onClick={() => goTo(index + 1)}
            aria-label={t('sunnyChat.nextPhoto')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[#1a2441]/80 px-2 py-0.5 text-[11px] text-white">
            {index + 1} / {count}
          </p>
        </>
      ) : null}
    </div>
  );
}
