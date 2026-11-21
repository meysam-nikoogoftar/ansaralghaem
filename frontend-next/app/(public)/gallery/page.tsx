import type { Metadata } from 'next'
import PageHeading from '@/components/content/page-heading'
import GalleryGrid from '@/components/content/gallery-grid'
import { getGallery } from '@/lib/api/public'
import { pageMetadata } from '@/lib/seo'
export const metadata: Metadata = pageMetadata(
  'گالری تصاویر',
  '/gallery',
  'تصاویر ارسالی زائرین و اعضای هیئت دانشجویی انصار القائم (عج)',
)
export default async function GalleryPage() {
  const images = await getGallery()
  return (
    <div className="gl-page">
      <div className="container">
        <PageHeading className="gl-head" title="گالری تصاویر" />
        {images.length ? (
          <GalleryGrid images={images} />
        ) : (
          <p className="gl-empty">تصویری وجود ندارد</p>
        )}
      </div>
    </div>
  )
}
