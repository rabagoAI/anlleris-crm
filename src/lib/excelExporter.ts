import * as XLSX from 'xlsx'
import type { Producto } from '../types'

/** Exporta el inventario actual a un archivo .xlsx con el mismo formato que el original */
export function exportToExcel(productos: Producto[]): void {
  const wb = XLSX.utils.book_new()

  // Fila de título
  const titleRow = ['', 'Plantilla stock Proveedores']
  const emptyRow: string[] = []
  const headerRow = [
    'Ref. Catalysis',
    'Ref. Proveedor',
    'Descripción',
    'Unidades',
    'Unidad de Medida',
    'Nombre Proveedor',
    'Fecha recuento',
    'Fecha utilización',
  ]

  const dataRows = productos.map((p) => [
    p.refCatalysis,
    p.refProveedor ?? '',
    p.descripcion,
    p.unidades,
    p.unidadMedida,
    p.proveedor,
    p.fechaRecuento ?? '',
    p.fechaUtilizacion ?? '',
  ])

  const wsData = [titleRow, emptyRow, headerRow, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Ajustar anchos de columna aproximados
  ws['!cols'] = [
    { wch: 14 }, { wch: 16 }, { wch: 45 }, { wch: 10 },
    { wch: 16 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Stock')

  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  XLSX.writeFile(wb, `ANLLERIS_stock_${fecha}.xlsx`)
}
