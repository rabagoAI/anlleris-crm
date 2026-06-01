import { useMemo, useState } from 'react'
import { BellRing, BellOff, Search, TrendingDown } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useInventoryStore } from '../store/inventoryStore'
import { necesitaReposicion } from '../types'
import ProductModal from '../components/inventory/ProductModal'
import type { Producto } from '../types'

interface AlertasPageProps {
  onToast: (msg: string) => void
}

export default function AlertasPage({ onToast }: AlertasPageProps) {
  const productos = useInventoryStore((s) => s.productos)
  const updateProducto = useInventoryStore((s) => s.updateProducto)

  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<Producto | null>(null)

  const alertas = useMemo(() =>
    productos
      .filter(necesitaReposicion)
      .filter((p) => {
        if (!busqueda) return true
        return (
          p.refCatalysis.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.proveedor.toLowerCase().includes(busqueda.toLowerCase())
        )
      })
      .sort((a, b) => {
        // Ordenar por urgencia: mayor diferencia negativa (unidades - mínimo) primero
        const urgA = a.unidades - (a.stockMinimo ?? 0)
        const urgB = b.unidades - (b.stockMinimo ?? 0)
        return urgA - urgB
      }),
    [productos, busqueda]
  )

  // Referencias sin mínimo configurado
  const sinMinimo = productos.filter(
    (p) => p.stockMinimo === undefined || p.stockMinimo === 0
  ).length

  function handleSave(p: Producto) {
    updateProducto(p, 'Actualizado desde Alertas de reposición')
    setEditando(null)
    onToast('Referencia actualizada.')
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Alertas de reposición" />
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          <div>
            <p className="text-lg font-medium text-gray-500 mb-2">Sin datos todavía</p>
            <p className="text-sm">Importa un Excel en Inventario para configurar alertas.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Alertas de reposición" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Necesitan reposición</p>
            <p className="text-2xl font-bold mt-1 text-orange-500">{alertas.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Con mínimo configurado</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#185FA5' }}>
              {productos.length - sinMinimo}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sin mínimo definido</p>
            <p className="text-2xl font-bold mt-1 text-gray-400">{sinMinimo}</p>
          </div>
        </div>

        {/* Aviso si muchas referencias sin mínimo */}
        {sinMinimo > 0 && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
            <BellOff size={18} className="shrink-0 mt-0.5" />
            <p>
              <strong>{sinMinimo} referencias</strong> no tienen stock mínimo configurado.
              Edítalas desde Inventario o desde esta página para empezar a recibir alertas.
            </p>
          </div>
        )}

        {/* Estado vacío — todo en orden */}
        {alertas.length === 0 && !busqueda && (
          <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <BellRing size={20} className="shrink-0" />
            <div>
              <p className="font-medium">Todo en orden</p>
              <p className="text-sm mt-0.5">Ninguna referencia ha bajado de su stock mínimo. ¡Buen trabajo!</p>
            </div>
          </div>
        )}

        {/* Lista de alertas */}
        {(alertas.length > 0 || busqueda) && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar referencia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-400">{alertas.length} referencia{alertas.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ref. Catalysis</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Descripción</th>
                      <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Proveedor</th>
                      <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Stock actual</th>
                      <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Stock mínimo</th>
                      <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Déficit</th>
                      <th className="px-4 py-3 font-medium text-gray-600 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alertas.map((p) => {
                      const deficit = (p.stockMinimo ?? 0) - p.unidades
                      const critico = p.unidades === 0
                      return (
                        <tr key={p.id} className={`transition-colors ${critico ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-orange-50/40'}`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <BellRing size={13} className={critico ? 'text-red-500' : 'text-orange-500'} />
                              <span className="font-medium text-gray-800">{p.refCatalysis}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={p.descripcion}>{p.descripcion}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.proveedor}</td>
                          <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${critico ? 'text-red-600' : 'text-orange-600'}`}>
                            {p.unidades.toLocaleString('es-ES')}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                            {(p.stockMinimo ?? 0).toLocaleString('es-ES')}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className="flex items-center justify-end gap-1 text-red-600 font-medium">
                              <TrendingDown size={13} />
                              -{deficit.toLocaleString('es-ES')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setEditando(p)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {editando && (
        <ProductModal
          mode="edit"
          producto={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  )
}
