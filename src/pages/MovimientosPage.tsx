import { useMemo, useState } from 'react'
import { Search, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useInventoryStore } from '../store/inventoryStore'
import type { TipoMovimiento } from '../types'

const TIPO_CONFIG: Record<TipoMovimiento, { label: string; className: string }> = {
  importacion: { label: 'Importación',  className: 'bg-blue-100 text-blue-700' },
  creacion:    { label: 'Alta manual',  className: 'bg-purple-100 text-purple-700' },
  ajuste:      { label: 'Ajuste stock', className: 'bg-yellow-100 text-yellow-700' },
  edicion:     { label: 'Edición',      className: 'bg-gray-100 text-gray-600' },
  eliminacion: { label: 'Eliminación',  className: 'bg-red-100 text-red-700' },
}

function DiferenciaCell({ diferencia }: { diferencia: number }) {
  if (diferencia > 0)
    return (
      <span className="flex items-center gap-1 text-green-600 font-medium">
        <TrendingUp size={14} /> +{diferencia.toLocaleString('es-ES')}
      </span>
    )
  if (diferencia < 0)
    return (
      <span className="flex items-center gap-1 text-red-600 font-medium">
        <TrendingDown size={14} /> {diferencia.toLocaleString('es-ES')}
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-gray-400">
      <Minus size={14} /> 0
    </span>
  )
}

export default function MovimientosPage() {
  const movimientos = useInventoryStore((s) => s.movimientos)
  const clearMovimientos = useInventoryStore((s) => s.clearMovimientos)

  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | ''>('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const filtrados = useMemo(() => {
    return movimientos.filter((m) => {
      if (
        busqueda &&
        !m.refCatalysis.toLowerCase().includes(busqueda.toLowerCase()) &&
        !m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) &&
        !m.proveedor.toLowerCase().includes(busqueda.toLowerCase())
      )
        return false
      if (tipoFiltro && m.tipo !== tipoFiltro) return false
      return true
    })
  }, [movimientos, busqueda, tipoFiltro])

  // KPIs del historial
  const totalEntradas = movimientos.reduce((s, m) => s + (m.diferencia > 0 ? m.diferencia : 0), 0)
  const totalSalidas = movimientos.reduce((s, m) => s + (m.diferencia < 0 ? Math.abs(m.diferencia) : 0), 0)
  const totalAjustes = movimientos.filter((m) => m.tipo === 'ajuste').length

  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Historial de movimientos" />
        <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
          <div>
            <p className="text-lg font-medium text-gray-500 mb-2">Sin movimientos todavía</p>
            <p className="text-sm">Los movimientos se registran automáticamente al importar,<br />crear, editar o eliminar referencias.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Historial de movimientos"
        actions={
          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 size={14} />
            Limpiar historial
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total movimientos', value: movimientos.length, color: '#185FA5' },
            { label: 'Unidades entrada', value: `+${totalEntradas.toLocaleString('es-ES')}`, color: '#16a34a' },
            { label: 'Unidades salida', value: `-${totalSalidas.toLocaleString('es-ES')}`, color: '#dc2626' },
            { label: 'Ajustes manuales', value: totalAjustes, color: '#ea580c' },
          ].map((k) => (
            <div key={k.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{k.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por referencia, descripción o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as TipoMovimiento | '')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {(Object.keys(TIPO_CONFIG) as TipoMovimiento[]).map((t) => (
              <option key={t} value={t}>{TIPO_CONFIG[t].label}</option>
            ))}
          </select>
          {(busqueda || tipoFiltro) && (
            <button
              onClick={() => { setBusqueda(''); setTipoFiltro('') }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Fecha y hora</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ref. Catalysis</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Descripción</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Proveedor</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Antes</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Después</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">Diferencia</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map((m) => {
                  const cfg = TIPO_CONFIG[m.tipo]
                  const fecha = new Date(m.fecha)
                  const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                        <span className="font-medium text-gray-800">{fechaStr}</span>
                        <span className="text-gray-400 ml-1">{horaStr}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{m.refCatalysis}</td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate" title={m.descripcion}>{m.descripcion}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{m.proveedor}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{m.unidadesAntes.toLocaleString('es-ES')}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-800">{m.unidadesDespues.toLocaleString('es-ES')}</td>
                      <td className="px-4 py-2.5 text-right">
                        <DiferenciaCell diferencia={m.diferencia} />
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[140px] truncate" title={m.notas}>{m.notas ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal confirmar limpiar historial */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Limpiar historial</h2>
            <p className="text-sm text-gray-600 mb-6">
              Se eliminarán todos los registros de movimientos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => { clearMovimientos(); setShowConfirmClear(false) }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
