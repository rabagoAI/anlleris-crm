import { Search } from 'lucide-react'
import { useInventoryStore } from '../../store/inventoryStore'
import type { StockStatus } from '../../types'

export default function FilterBar() {
  const filtros = useInventoryStore((s) => s.filtros)
  const setFiltros = useInventoryStore((s) => s.setFiltros)
  const productos = useInventoryStore((s) => s.productos)

  const proveedoresUnicos = [...new Set(productos.map((p) => p.proveedor))].sort()
  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort() as string[]

  const hayFiltros = !!(filtros.busqueda || filtros.proveedor || filtros.estado || filtros.categoria)

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Buscador */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por referencia o descripción..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros({ busqueda: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtro categoría — solo aparece si hay categorías definidas */}
      {categoriasUnicas.length > 0 && (
        <select
          value={filtros.categoria}
          onChange={(e) => setFiltros({ categoria: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">Todas las categorías</option>
          {categoriasUnicas.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {/* Filtro proveedor */}
      <select
        value={filtros.proveedor}
        onChange={(e) => setFiltros({ proveedor: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
      >
        <option value="">Todos los proveedores</option>
        {proveedoresUnicos.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Filtro estado */}
      <select
        value={filtros.estado}
        onChange={(e) => setFiltros({ estado: e.target.value as StockStatus | '' })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
      >
        <option value="">Todos los estados</option>
        <option value="con_stock">Con stock</option>
        <option value="stock_bajo">Stock bajo</option>
        <option value="sin_stock">Sin stock</option>
      </select>

      {/* Limpiar */}
      {hayFiltros && (
        <button
          onClick={() => setFiltros({ busqueda: '', proveedor: '', estado: '', categoria: '' })}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
