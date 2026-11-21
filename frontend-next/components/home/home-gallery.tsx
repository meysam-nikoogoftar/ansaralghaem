'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from '@/components/navigation/app-link'
import Dialog from '@/components/ui/dialog'
import type { HomePhoto } from '@/types/home'
import { STATIC_GALLERY, GALLERY_TABS } from './home-content'
export default function HomeGallery({ photos }: { photos: HomePhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<HomePhoto | null>(null)
  const [galleryFilter, setGalleryFilter] = useState('all')
  const displayGallery = photos.length ? photos : STATIC_GALLERY
  const filteredGallery =
    galleryFilter === 'all'
      ? displayGallery
      : displayGallery.filter((photo) => photo.category === galleryFilter)
  return (
    <>
      {' '}
      {/* Gallery */}
      <section id="gallery">
        <div className="container">
          <div className="gallery-heading-row">
            <div className="section-head">
              <h2 className="section-title">لحظه‌های ماندگار مسیر</h2>
              <p className="section-desc">
                نگاهی به فضای معنوی کاروان‌های پیش‌رو و همراهی خادمین هیئت.
              </p>
            </div>
            <Link href="/gallery" className="gallery-view-all">
              <span>مشاهده همه تصاویر</span>
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5m6-6-6 6 6 6" />
              </svg>
            </Link>
          </div>

          <div className="gallery-tabs fade-in">
            {GALLERY_TABS.map((tab) => (
              <button
                aria-pressed={galleryFilter === tab.key}
                key={tab.key}
                className={`gallery-tab${galleryFilter === tab.key ? ' active' : ''}`}
                onClick={() => setGalleryFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`gallery-item${item.featured ? ' gallery-poster' : ''}`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={450}
                  sizes="(max-width:700px) 50vw, 25vw"
                  draggable={false}
                />
                <span className="gallery-caption">{item.title}</span>
              </button>
            ))}
          </div>
          {filteredGallery.length === 0 && (
            <p className="gallery-empty" role="status">
              تصویری در این دسته وجود ندارد. برای دیدن تصاویر دیگر، دسته «همه» را انتخاب کنید.
            </p>
          )}
          <div className="gallery-mobile-action">
            <Link href="/gallery" className="gallery-view-all">
              <span>مشاهده همه تصاویر</span>
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5m6-6-6 6 6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {selectedPhoto && (
        <Dialog
          label={selectedPhoto.title}
          className="home-lightbox"
          onClose={() => setSelectedPhoto(null)}
        >
          <Image
            src={selectedPhoto.image}
            alt={selectedPhoto.title}
            width={1200}
            height={900}
            sizes="95vw"
            draggable={false}
          />
          <p>{selectedPhoto.title}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setSelectedPhoto(null)}>
            بستن
          </button>
        </Dialog>
      )}
    </>
  )
}
