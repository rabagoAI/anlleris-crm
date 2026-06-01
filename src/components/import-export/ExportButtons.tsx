import { useState } from 'react'
import { Download, FileText, X } from 'lucide-react'
import { useInventoryStore, useProductosFiltrados } from '../../store/inventoryStore'
import { exportToExcel } from '../../lib/excelExporter'
import { exportToPdf } from '../../lib/pdfExporter'

interface ExportButtonsProps {
  onToast: (msg: string) => void
}

interface PdfModalState {
  titulo: string
  orientacion: 'landscape' | 'portrait'
}

export default function ExportButtons({ onToast }: ExportButtonsProps) {
  const totalProductos = useInventoryStore((s) => s.productos.length)
  // Productos que pasan los filtros activos — son los que se exportarán
  const productosFiltrados = useProductosFiltrados()
  const filtros = useInventoryStore((s) => s.filtros)

  const hayFiltrosActivos =
    !!filtros.busqueda || !!filtros.proveedor || !!filtros.estado

  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfOpts, setPdfOpts] = useState<PdfModalState>({
    titulo: 'Informe de Stock',
    orientacion: 'landscape',
  })

  function handleExcelExport() {
    if (productosFiltrados.length === 0) { onToast('No hay datos para exportar.'); return }
    exportToExcel(productosFiltrados)
    const msg = hayFiltrosActivos
      ? `Excel exportado (${productosFiltrados.length} referencias filtradas).`
      : `Excel exportado correctamente.`
    onToast(msg)
  }

  function handlePdfExport() {
    if (productosFiltrados.length === 0) { onToast('No hay datos para exportar.'); return }
    exportToPdf({ ...pdfOpts, incluirTodos: true, productos: productosFiltrados })
    setShowPdfModal(false)
    const msg = hayFiltrosActivos
      ? `PDF generado (${productosFiltrados.length} referencias filtradas).`
      : `PDF generado correctamente.`
    onToast(msg)
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleExcelExport}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Download size={15} className="text-green-600" />
          Exportar Excel
        </button>
        <button
          onClick={() => setShowPdfModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <FileText size={15} className="text-red-500" />
          Exportar PDF
        </button>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Opciones de PDF</h2>
              <button onClick={() => setShowPdfModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del informe</label>
                <input
                  type="text"
                  value={pdfOpts.titulo}
                  onChange={(e) => setPdfOpts((o) => ({ ...o, titulo: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientación</label>
                <select
                  value={pdfOpts.orientacion}
                  onChange={(e) => setPdfOpts((o) => ({ ...o, orientacion: e.target.value as 'landscape' | 'portrait' }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="landscape">Horizontal (recomendado)</option>
                  <option value="portrait">Vertical</option>
                </select>
              </div>

              {/* Aviso claro sobre qué se va a exportar */}
              <div className={`text-xs rounded-lg px-3 py-2 ${hayFiltrosActivos ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                {hayFiltrosActivos ? (
                  <>
                    Se exportarán <strong>{productosFiltrados.length}</strong> referencias
                    (filtro activo — de {totalProductos} en total).
                  </>
                ) : (
                  <>Se incluirán las {totalProductos} referencias del inventario.</>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePdfExport}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#185FA5' }}
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
