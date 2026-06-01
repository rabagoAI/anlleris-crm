import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Producto } from '../types'
import { getStockStatus } from '../types'

export interface PdfOptions {
  titulo: string
  /** Si true, incluye todos los productos; si false, solo los visibles/filtrados */
  incluirTodos: boolean
  orientacion: 'landscape' | 'portrait'
  productos: Producto[]
}

/** Genera y descarga el PDF del inventario */
export function exportToPdf(opts: PdfOptions): void {
  const { titulo, orientacion, productos } = opts

  const doc = new jsPDF(orientacion, 'mm', 'a4')

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // --- Métricas resumen ---
  const total = productos.length
  const conStock = productos.filter((p) => getStockStatus(p.unidades) === 'con_stock').length
  const sinStock = productos.filter((p) => getStockStatus(p.unidades) === 'sin_stock').length
  const stockBajo = productos.filter((p) => getStockStatus(p.unidades) === 'stock_bajo').length

  const pageW = doc.internal.pageSize.getWidth()

  // Cabecera
  doc.setFontSize(18)
  doc.setTextColor(24, 95, 165) // #185FA5
  doc.text('ANLLERIS', 14, 16)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(titulo, 14, 24)
  doc.text(`Generado: ${fechaHoy}`, pageW - 14, 16, { align: 'right' })

  // Métricas
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(
    `Total: ${total}  |  Con stock: ${conStock}  |  Stock bajo: ${stockBajo}  |  Sin stock: ${sinStock}`,
    14,
    30,
  )

  // Línea separadora
  doc.setDrawColor(229, 231, 235)
  doc.line(14, 33, pageW - 14, 33)

  // Tabla
  autoTable(doc, {
    startY: 37,
    head: [['Ref. Catalysis', 'Ref. Proveedor', 'Descripción', 'Unidades', 'U. Medida', 'Proveedor', 'F. Recuento', 'Estado']],
    body: productos.map((p) => {
      const st = getStockStatus(p.unidades)
      const estadoLabel =
        st === 'con_stock' ? 'Con stock' : st === 'stock_bajo' ? 'Stock bajo' : 'Sin stock'
      return [
        p.refCatalysis,
        p.refProveedor ?? '',
        p.descripcion,
        p.unidades.toLocaleString('es-ES'),
        p.unidadMedida,
        p.proveedor,
        p.fechaRecuento ?? '',
        estadoLabel,
      ]
    }),
    headStyles: { fillColor: [24, 95, 165], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: { 2: { cellWidth: orientacion === 'landscape' ? 60 : 40 } },
    didDrawCell: (data) => {
      // Colorear columna Estado según valor
      if (data.section === 'body' && data.column.index === 7) {
        const val = String(data.cell.raw)
        if (val === 'Sin stock') doc.setTextColor(220, 38, 38)
        else if (val === 'Stock bajo') doc.setTextColor(234, 88, 12)
        else doc.setTextColor(22, 163, 74)
      }
    },
  })

  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  doc.save(`ANLLERIS_stock_${fecha}.pdf`)
}
