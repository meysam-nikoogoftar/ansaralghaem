import ownership from '../../../shared/migration-routes.json'

export function isNextPath(pathname) {
  const path = pathname.replace(/\/$/, '') || '/'
  return ownership.nextExact.includes(path)
    || ownership.nextSingleSegment.includes(path.slice(0, path.lastIndexOf('/')))
    || ownership.nextPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}
