export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = (Date.now() - then) / 1000
  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [30, 'd'],
    [12, 'mo'],
    [Number.POSITIVE_INFINITY, 'y'],
  ]
  let val = secs
  let unit = 's'
  for (const [div, u] of units) {
    if (val < div) {
      unit = u
      break
    }
    val = val / div
    unit = u
  }
  return `${Math.floor(val)}${unit} ago`
}
