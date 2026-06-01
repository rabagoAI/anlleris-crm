import * as XLSX from 'xlsx'
import type { Producto } from '../types'

/** Convierte un número de serie Excel a cadena DD/MM/YYYY */
function excelDateToString(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string' && value.includes('/')) return value
  const num = Number(value)
  if (isNaN(num)) return undefined
  const date = XLSX.SSF.parse_date_code(num)
  if (!date) return undefined
  const d = String(date.d).padStart(2, '0')
  const m = String(date.m).padStart(2, '0')
  return `${d}/${m}/${date.y}`
}

/**
 * Lee un File .xlsx y devuelve un array de Producto.
 * La cabecera del Excel de ANLLERIS está en la fila de índice 2 (fila 3 visual).
 * Las columnas esperadas:
 *   Ref. Catalysis | Ref. Proveedor | Descripción | Unidades |
 *   Unidad de Medida | Nombre Proveedor | Fecha recuento | Fecha utilización
 */
export async function parseExcel(file: File): Promise<Producto[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]

  // Leer como array de arrays para controlar la fila de cabecera
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

  // La cabecera está en el índice 2
  const HEADER_ROW = 2
  const dataRows = rows.slice(HEADER_ROW + 1)

  const productos: Producto[] = []

  for (const row of dataRows) {
    const r = row as unknown[]
    const refCatalysis = String(r[0] ?? '').trim()
    const descripcion = String(r[2] ?? '').trim()

    // Saltar filas vacías o sin ref obligatoria
    if (!refCatalysis || !descripcion) continue

    const unidadesRaw = Number(r[3])
    const producto: Producto = {
      id: crypto.randomUUID(),
      refCatalysis,
      refProveedor: String(r[1] ?? '').trim() || undefined,
      descripcion,
      unidades: isNaN(unidadesRaw) ? 0 : unidadesRaw,
      unidadMedida: String(r[4] ?? '').trim() || '1 UND',
      proveedor: String(r[5] ?? '').trim() || 'Sin proveedor',
      fechaRecuento: excelDateToString(r[6]),
      fechaUtilizacion: excelDateToString(r[7]),
    }
    productos.push(producto)
  }

  return productos
}
