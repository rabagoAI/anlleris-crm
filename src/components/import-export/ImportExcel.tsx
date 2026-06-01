import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, RefreshCw, Replace, X } from 'lucide-react'
import { parseExcel } from '../../lib/excelParser'
import { useInventoryStore } from '../../store/inventoryStore'
import type { ResultadoImportacion } from '../../types'

interface ImportExcelProps {
  onToast: (msg: string) => void
}

type Modo = 'incremental' | 'completa'

interface ArchivoListo {
  file: File
  nombre: string
}

export default function ImportExcel({ onToast }: ImportExcelProps) {
  const setProductos = useInventoryStore((s) => s.setProductos)
  const mergeProductos = useInventoryStore((s) => s.mergeProductos)
  const hayDatos = useInventoryStore((s) => s.productos.length > 0)

  const [dragging, setDragging] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [archivoListo, setArchivoListo] = useState<ArchivoListo | null>(null)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function procesarArchivo(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      onToast('El archivo debe ser un Excel (.xlsx o .xls)')
      return
    }
    // Si ya hay datos, preguntar el modo; si no, importar directamente
    if (hayDatos) {
      setArchivoListo({ file, nombre: file.name })
    } else {
      await ejecutarImportacion(file, 'completa')
    }
  }

  async function ejecutarImportacion(file: File, modo: Modo) {
    setCargando(true)
    setArchivoListo(null)
    try {
      const productos = await parseExcel(file)
      if (modo === 'incremental') {
        const res = mergeProductos(productos)
        setResultado(res)
        onToast(
          `Importación incremental: ${res.nuevas} nuevas, ${res.actualizadas} actualizadas, ${res.sinCambios} sin cambios.`
        )
      } else {
        setProductos(productos)
        setResultado({ nuevas: productos.length, actualizadas: 0, sinCambios: 0, ignoradas: 0 })
        onToast(`${productos.length} referencias importadas correctamente.`)
      }
    } catch {
      onToast('Error al leer el archivo. Comprueba que es el Excel correcto.')
    } finally {
      setCargando(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) procesarArchivo(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) procesarArchivo(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Zona drag & drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !cargando && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/30'
        }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleChange} />

        {cargando ? (
          <div className="flex flex-col items-center gap-3 text-blue-600">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Importando referencias…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              {dragging ? <FileSpreadsheet size={24} className="text-blue-500" /> : <Upload size={24} className="text-blue-400" />}
            </div>
            <p className="font-medium text-gray-700 text-sm">
              {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu Excel aquí o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-400">Archivos .xlsx — Plantilla stock Catalysis</p>
          </div>
        )}
      </div>

      {/* Resultado de la última importación */}
      {resultado && !archivoListo && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm">
          <div className="flex flex-wrap gap-4 text-green-700">
            {resultado.nuevas > 0 && <span>✚ <strong>{resultado.nuevas}</strong> nuevas</span>}
            {resultado.actualizadas > 0 && <span>↺ <strong>{resultado.actualizadas}</strong> actualizadas</span>}
            {resultado.sinCambios > 0 && <span>= <strong>{resultado.sinCambios}</strong> sin cambios</span>}
            {resultado.ignoradas > 0 && <span className="text-gray-400">— <strong>{resultado.ignoradas}</strong> ignoradas</span>}
          </div>
          <button onClick={() => setResultado(null)} className="text-green-400 hover:text-green-600 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modal elección de modo (solo cuando ya hay datos) */}
      {archivoListo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">¿Cómo importar?</h2>
              <button onClick={() => setArchivoListo(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Archivo: <span className="font-medium text-gray-600">{archivoListo.nombre}</span>
            </p>

            <div className="space-y-3">
              {/* Opción incremental */}
              <button
                onClick={() => ejecutarImportacion(archivoListo.file, 'incremental')}
                className="w-full text-left flex items-start gap-4 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200">
                  <RefreshCw size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Actualizar referencias existentes</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Detecta qué referencias han cambiado y solo actualiza esas.
                    Las referencias nuevas se añaden. Las que no están en el Excel se conservan.
                    <strong className="text-blue-600"> Categorías y stock mínimo no se pierden.</strong>
                  </p>
                </div>
              </button>

              {/* Opción completa */}
              <button
                onClick={() => ejecutarImportacion(archivoListo.file, 'completa')}
                className="w-full text-left flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100">
                  <Replace size={18} className="text-gray-500 group-hover:text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Reemplazar todo el inventario</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Elimina todos los datos actuales y los reemplaza con el contenido del Excel.
                    <strong className="text-orange-600"> Se perderán categorías y configuraciones manuales.</strong>
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
