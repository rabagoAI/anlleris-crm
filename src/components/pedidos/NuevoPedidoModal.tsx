import { useState, useMemo } from 'react'
import { X, Plus, Trash2, Search } from 'lucide-react'
import { useInventoryStore, useNextNumeroPedido } from '../../store/inventoryStore'
import type { Pedido, LineaPedido } from '../../types'

interface NuevoPedidoModalProps {
  onSave: (p: Pedido) => void
  onClose: () => void
}

interface LineaForm {
  productoId: string
  refCatalysis: string
  descripcion: string
  unidadMedida: string
  unidadesPedidas: number
}

export default function NuevoPedidoModal({ onSave, onClose }: NuevoPedidoModalProps) {
  const productos = useInventoryStore((s) => s.productos)
  const numeroPedido = useNextNumeroPedido()

  const [proveedor, setProveedor] = useState('')
  const [fechaEsperada, setFechaEsperada] = useState('')
  const [notas, setNotas] = useState('')
  const [lineas, setLineas] = useState<LineaForm[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [error, setError] = useState('')

  // Proveedores únicos del inventario
  const proveedores = useMemo(
    () => [...new Set(productos.map((p) => p.proveedor))].sort(),
    [productos]
  )

  // Productos del proveedor seleccionado filtrados por búsqueda
  const productosFiltrados = useMemo(() => {
    if (!proveedor) return []
    return productos
      .filter((p) => p.proveedor === proveedor)
      .filter((p) => {
        if (!busquedaProducto) return true
        return (
          p.refCatalysis.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase())
        )
      })
      .slice(0, 30)
  }, [productos, proveedor, busquedaProducto])

  function agregarLinea(productoId: string) {
    const prod = productos.find((p) => p.id === productoId)
    if (!prod) return
    if (lineas.some((l) => l.productoId === productoId)) return // ya añadida
    setLineas((ls) => [
      ...ls,
      {
        productoId: prod.id,
        refCatalysis: prod.refCatalysis,
        descripcion: prod.descripcion,
        unidadMedida: prod.unidadMedida,
        unidadesPedidas: 0,
      },
    ])
    setBusquedaProducto('')
  }

  function eliminarLinea(productoId: string) {
    setLineas((ls) => ls.filter((l) => l.productoId !== productoId))
  }

  function setUnidades(productoId: string, val: number) {
    setLineas((ls) =>
      ls.map((l) => (l.productoId === productoId ? { ...l, unidadesPedidas: val } : l))
    )
  }

  function handleGuardar() {
    if (!proveedor) { setError('Selecciona un proveedor.'); return }
    if (lineas.length === 0) { setError('Añade al menos una referencia al pedido.'); return }
    if (lineas.some((l) => l.unidadesPedidas <= 0)) {
      setError('Todas las líneas deben tener unidades mayores que 0.')
      return
    }
    setError('')

    const pedido: Pedido = {
      id: crypto.randomUUID(),
      numeroPedido,
      proveedor,
      fechaCreacion: new Date().toISOString(),
      fechaEsperada: fechaEsperada || undefined,
      estado: 'pendiente',
      notas: notas.trim() || undefined,
      lineas: lineas.map(
        (l): LineaPedido => ({
          id: crypto.randomUUID(),
          productoId: l.productoId,
          refCatalysis: l.refCatalysis,
          descripcion: l.descripcion,
          unidadMedida: l.unidadMedida,
          unidadesPedidas: l.unidadesPedidas,
          unidadesRecibidas: 0,
        })
      ),
    }
    onSave(pedido)
  }

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nuevo pedido</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ref. {numeroPedido}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Proveedor + fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Proveedor <span className="text-red-500">*</span></label>
              <select
                value={proveedor}
                onChange={(e) => { setProveedor(e.target.value); setLineas([]) }}
                className={inputClass}
              >
                <option value="">Selecciona proveedor…</option>
                {proveedores.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha esperada de llegada</label>
              <input
                type="date"
                value={fechaEsperada
                  ? fechaEsperada.split('/').reverse().join('-')
                  : ''}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split('-')
                  setFechaEsperada(e.target.value ? `${d}/${m}/${y}` : '')
                }}
                className={inputClass}
              />
            </div>
          </div>

          {/* Buscador de productos del proveedor */}
          {proveedor && (
            <div>
              <label className={labelClass}>Añadir referencias del pedido</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Busca por ref. o descripción y haz clic para añadir…"
                />
              </div>

              {/* Resultados del buscador */}
              {busquedaProducto && (
                <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                  {productosFiltrados.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    productosFiltrados.map((prod) => {
                      const yaEnLineas = lineas.some((l) => l.productoId === prod.id)
                      return (
                        <button
                          key={prod.id}
                          disabled={yaEnLineas}
                          onClick={() => agregarLinea(prod.id)}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between border-b last:border-0 border-gray-100 transition-colors ${
                            yaEnLineas
                              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                              : 'hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          <span>
                            <span className="font-medium">{prod.refCatalysis}</span>
                            <span className="text-gray-400 ml-2 truncate">{prod.descripcion}</span>
                          </span>
                          {yaEnLineas ? (
                            <span className="text-xs text-gray-300">Añadida</span>
                          ) : (
                            <Plus size={14} className="text-blue-500 shrink-0" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Líneas del pedido */}
          {lineas.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Referencias del pedido ({lineas.length})
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Ref.</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Descripción</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600 w-32">Unidades</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineas.map((l) => (
                      <tr key={l.productoId}>
                        <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{l.refCatalysis}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate" title={l.descripcion}>{l.descripcion}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              min={1}
                              value={l.unidadesPedidas || ''}
                              onChange={(e) => setUnidades(l.productoId, Number(e.target.value))}
                              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                            <span className="text-xs text-gray-400">{l.unidadMedida}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => eliminarLinea(l.productoId)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className={labelClass}>Notas</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Instrucciones, condiciones de entrega…"
            />
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
            onClick={handleGuardar}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#185FA5' }}
          >
            Crear pedido
          </button>
        </div>
      </div>
    </div>
  )
}
