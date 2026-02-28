import { ref } from 'vue'
import { format } from 'date-fns'

interface ExportColumn<T = any> {
  key: string
  header: string
  transform?: (value: any, row: T) => string | number
  width?: number
}

interface ExportOptions<T> {
  filename: string
  data: T[]
  columns: readonly ExportColumn<T>[]
}

interface ExportXLSXOptions<T> extends Omit<ExportOptions<T>, 'data' | 'columns'> {
  sheets: Array<{
    name: string
    data: T[]
    columns?: readonly ExportColumn<T>[]
  }>
}

interface ExportPDFOptions<T> extends ExportOptions<T> {
  title?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'letter'
}

export function useExport() {
  const isExporting = ref(false)

  function transformData<T>(
    data: T[],
    columns: readonly ExportColumn<T>[],
  ): (string | number)[][] {
    const headers = columns.map((col) => col.header)
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = getNestedValue(row, col.key)
        return col.transform ? col.transform(value, row) : (value ?? '')
      }),
    )
    return [headers, ...rows]
  }

  function getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function exportCSV<T>(options: ExportOptions<T>): Promise<void> {
    isExporting.value = true

    try {
      const rows = transformData(options.data, options.columns)
      const csvContent = rows
        .map((row) =>
          row.map((cell) => {
            const str = String(cell)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          }).join(','),
        )
        .join('\n')

      const bom = '\uFEFF'
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(blob, `${options.filename}.csv`)
    } finally {
      isExporting.value = false
    }
  }

  async function exportXLSX<T>(options: ExportXLSXOptions<T>): Promise<void> {
    isExporting.value = true

    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.utils.book_new()

      for (const sheet of options.sheets) {
        const columns = sheet.columns || []
        const rows = columns.length > 0
          ? transformData(sheet.data, columns)
          : [Object.keys(sheet.data[0] || {}), ...sheet.data.map((d) => Object.values(d as Record<string, unknown>))]

        const worksheet = XLSX.utils.aoa_to_sheet(rows)

        if (columns.length > 0) {
          worksheet['!cols'] = columns.map((col) => ({
            wch: col.width || Math.max(
              col.header.length,
              ...rows.slice(1).map((r) => String(r[columns.indexOf(col)] ?? '').length),
            ) + 2,
          }))
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
      }

      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      downloadBlob(blob, `${options.filename}.xlsx`)
    } finally {
      isExporting.value = false
    }
  }

  async function exportPDF<T>(options: ExportPDFOptions<T>): Promise<void> {
    isExporting.value = true

    try {
      const { default: jsPDF } = await import('jspdf')
      await import('jspdf-autotable')

      const doc = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: options.pageSize || 'a4',
      })

      if (options.title) {
        doc.setFontSize(16)
        doc.text(options.title, 14, 20)
        doc.setFontSize(10)
        doc.text(
          `Дата: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
          14, 28,
        )
      }

      const rows = transformData(options.data, options.columns)
      const headers = rows[0]
      const body = rows.slice(1)

      ;(doc as any).autoTable({
        head: [headers],
        body,
        startY: options.title ? 35 : 15,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      })

      doc.save(`${options.filename}.pdf`)
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    exportCSV,
    exportXLSX,
    exportPDF,
  }
}
