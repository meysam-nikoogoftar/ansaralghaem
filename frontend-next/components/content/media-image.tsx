import Image from 'next/image'
import { safeMediaPath } from '@/lib/urls'
export default function MediaImage({
  src,
  alt,
  className,
  hero = false,
  priority = false,
  sizes,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  hero?: boolean
  priority?: boolean
  sizes?: string
}) {
  const path = safeMediaPath(src)
  return path ? (
    <Image
      src={path}
      alt={alt}
      width={1200}
      height={675}
      sizes={
        sizes ||
        (hero
          ? '(max-width: 800px) 100vw, 760px'
          : '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px')
      }
      preload={hero || priority}
      className={className}
    />
  ) : null
}
