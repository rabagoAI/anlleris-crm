import { useState } from 'react'
import { X, PackageCheck } from 'lucide-react'
import type { Pedido, LineaPedido } from '../../types'

interface RecepcionModalProps {
  pedido: Pedido
  onConfirmar: (lineas: LineaPedido[]) => void
  onClose: () => void
}

export default function RecepcionModal({ pedido, onConfirmar, onClose }: RecepcionModalProps) {
  // Estado local: unidades recibidas por línea (pre-relleno con las pedidas)
  const [lineas, setLineas] = useState<LineaPedido[]>(
    pedido.lineas.map((l) => ({
      ...l,
      // Si ya tiene recibidas parciales, partir de ahí; si no, proponer el total pedido
      unidadesRecibidas: l.unidadesRecibidas > 0 ? 0 : l.unidadesPedidas,
    }))
  )
  const [error, setError] = useState('')

  function setRecibidas(lineaId: string, valor: number) {
    setLineas((ls) =>
      ls.map((l) => (l.id === lineaId ? { ...l, unidadesRecibidas: valor } : l))
    )
  }

  function rellenarTodo() {
    setLineas((ls) => ls.map((l) => ({ ...l, unidadesRecibidas: l.unidadesPedidas })))
  }

  function handleConfirmar() {
    const alguienRecibe = lineas.some((l) => l.unidadesRecibidas > 0)
    if (!alguienRecibe) {
      setError('Indica las unidades recibidas en al menos una línea.')
      return
    }
    const excede = lineas.find((l) => l.unidadesRecibidas > l.unidadesPedidas)
    if (excede) {
      setError(`La línea "${excede.refCatalysis}" supera las unidades pedidas.`)
      return
    }
    setError('')
    onConfirmar(lineas)
  }

  const totalPedido = lineas.reduce((s, l) => s + l.unidadesPedidas, 0)
  const totalRecibido = lineas.reduce((s, l) => s + l.unidadesRecibidas, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recepcionar pedido</h2>
            <p className="text-xs text-gray-400 mt-0.5">{pedido.numeroPedido} · {pedido.proveedor}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Indica las unidades que has recibido en cada línea.
              Las unidades se sumarán al stock automáticamente.
            </p>
            <button
              onClick={rellenarTodo}
              className="text-xs font-medium text-blue-600 hover:underline shrink-0 ml-4"
            >
              Recibir todo
            </button>
          </div>

          {/* Tabla de recepción */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Ref.</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Descripción</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-600 whitespace-nowrap">Pedidas</th>
                  <th className="px-4 py-2.5 text-center font-medium text-gray-600 whitespace-nowrap w-36">Recibidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map((l) => {
                  const completa = l.unidadesRecibidas === l.unidadesPedidas
                  const parcial = l.unidadesRecibidas > 0 && !completa
                  return (
                    <tr key={l.id} className={completa ? 'bg-green-50/40' : parcial ? 'bg-yellow-50/40' : ''}>
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{l.refCatalysis}</td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate" title={l.descripcion}>{l.descripcion}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">
                        {l.unidadesPedidas.toLocaleString('es-ES')} {l.unidadMedida}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={0}
                          max={l.unidadesPedidas}
                          value={l.unidadesRecibidas || ''}
                          onChange={(e) => setRecibidas(l.id, Number(e.target.value))}
                          className={`w-full text-sm border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            completa ? 'border-green-300 bg-green-50' : 'border-gray-200'
                          }`}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-gray-600">Total recibido</span>
            <span className={`font-semibold ${totalRecibido === totalPedido ? 'text-green-600' : 'text-orange-500'}`}>
              {totalRecibido.toLocaleString('es-ES')} / {totalPedido.toLocaleString('es-ES')} uds.
            </span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#185FA5' }}
          >
            <PackageCheck size={16} />
            Confirmar recepción
          </button>
        </div>
      </div>
    </div>
  )
}
