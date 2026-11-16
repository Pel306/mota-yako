"use client";

import Image from "next/image";
import { useState } from "react";

export function PhotoGallery({ src, alt, images = [src] }: { src: string; alt: string; images?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedImage = images[activeIndex] ?? src;

  return (
    <>
      <div className="gallery">
        <button
          type="button"
          className="gallery-main"
          onClick={() => setIsOpen(true)}
          aria-label={`Open full-size photo of ${alt}`}
        >
          <Image src={selectedImage} alt={alt} width={1200} height={750} priority unoptimized />
        </button>
        <div className="thumb-grid">
          {images.map((image, index) => (
            <button
              type="button"
              className={`thumb ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              onDoubleClick={() => setIsOpen(true)}
              key={image}
              aria-label={`View photo ${index + 1} of ${alt}`}
            >
              <Image src={image} alt="" width={180} height={120} unoptimized />
            </button>
          ))}
        </div>
      </div>
      {isOpen && (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo`}
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="photo-lightbox-close"
            aria-label="Close photo"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
          <Image src={selectedImage} alt={alt} width={1600} height={1000} unoptimized />
        </div>
      )}
    </>
  );
}
