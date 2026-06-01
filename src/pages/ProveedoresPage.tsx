import TopBar from '../components/layout/TopBar'
import { useInventoryStore } from '../store/inventoryStore'
import { getStockStatus } from '../types'

export default function ProveedoresPage() {
  const productos = useInventoryStore((s) => s.productos)

  if (productos.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Proveedores" />
        <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
          <div>
            <p className="text-lg font-medium text-gray-500 mb-2">Sin datos todavía</p>
            <p className="text-sm">Importa un Excel en la sección Inventario para ver los proveedores.</p>
          </div>
        </div>
      </div>
    )
  }

  // Calcular resumen por proveedor
  const mapa = new Map<string, { refs: number; unidades: number; sinStock: number }>()
  for (const p of productos) {
    const entry = mapa.get(p.proveedor) ?? { refs: 0, unidades: 0, sinStock: 0 }
    entry.refs += 1
    entry.unidades += p.unidades
    if (getStockStatus(p.unidades) === 'sin_stock') entry.sinStock += 1
    mapa.set(p.proveedor, entry)
  }

  const filas = [...mapa.entries()]
    .map(([nombre, datos]) => ({
      nombre,
      ...datos,
      pctSinStock: datos.refs > 0 ? Math.round((datos.sinStock / datos.refs) * 100) : 0,
    }))
    .sort((a, b) => b.unidades - a.unidades)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Proveedores" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Proveedor</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Nº Referencias</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Total Unidades</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">% Sin stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((f) => (
                <tr key={f.nombre} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{f.nombre}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{f.refs}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{f.unidades.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={`font-medium ${
                        f.pctSinStock > 30
                          ? 'text-red-600'
                          : f.pctSinStock > 10
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {f.pctSinStock}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {filas.length} proveedor{filas.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
