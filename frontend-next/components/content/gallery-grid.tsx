'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/dialog'
import MediaImage from './media-image'
import type { GalleryImage } from '@/types'
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  return (
    <>
      <div className="gl-grid">
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            className="gl-item"
            aria-label={`نمایش تصویر ${image.title || 'گالری'}`}
            onClick={() => setSelected(image)}
          >
            <MediaImage src={image.image} alt={image.title || 'تصویر گالری'} />
            <span className="gl-item-overlay">
              <span>{image.title}</span>
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <Dialog label="نمایش تصویر" className="gl-lightbox" onClose={() => setSelected(null)}>
          <div className="gl-lightbox-content">
            <MediaImage
              src={selected.image}
              alt={selected.title || 'تصویر گالری'}
              sizes="(max-width: 760px) 100vw, 720px"
            />
            <p className="gl-lightbox-title">{selected.title}</p>
            <p className="gl-lightbox-uploader">{selected.uploader_name}</p>
            <button className="gl-lightbox-close" onClick={() => setSelected(null)}>
              بستن
            </button>
          </div>
        </Dialog>
      )}
    </>
  )
}
