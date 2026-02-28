export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsvString(rows: (string | number)[][]): string {
  const content = rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n')
  return '\uFEFF' + content
}
