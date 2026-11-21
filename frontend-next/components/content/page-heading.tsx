export default function PageHeading({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className: string
}) {
  return (
    <header className={className}>
      <h1 className="section-title">{title}</h1>
      {description && <p className="section-desc">{description}</p>}
    </header>
  )
}
