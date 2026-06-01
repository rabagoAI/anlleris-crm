import TopBar from '../components/layout/TopBar'
import StockByStatusChart from '../components/charts/StockByStatusChart'
import StockByProveedorChart from '../components/charts/StockByProveedorChart'
import StockByCategoriaChart from '../components/charts/StockByCategoriaChart'
import ObsoleteAlert from '../components/charts/ObsoleteAlert'
import { useInventoryStore } from '../store/inventoryStore'
import { getStockStatus } from '../types'

export default function InformesPage() {
  const productos = useInventoryStore((s) => s.productos)

  if (productos.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Informes" />
        <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
          <div>
            <p className="text-lg font-medium text-gray-500 mb-2">Sin datos todavía</p>
            <p className="text-sm">Importa un Excel en la sección Inventario para ver los informes.</p>
          </div>
        </div>
      </div>
    )
  }

  // KPIs
  const total = productos.length
  const conStock = productos.filter((p) => getStockStatus(p.unidades) === 'con_stock').length
  const pctConStock = total > 0 ? Math.round((conStock / total) * 100) : 0
  const totalUnidades = productos.reduce((s, p) => s + p.unidades, 0)

  // Proveedor principal (más unidades)
  const mapa = new Map<string, number>()
  for (const p of productos) mapa.set(p.proveedor, (mapa.get(p.proveedor) ?? 0) + p.unidades)
  const proveedorPrincipal = [...mapa.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Informes" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total referencias', value: total.toLocaleString('es-ES') },
            { label: 'Total unidades', value: totalUnidades.toLocaleString('es-ES') },
            { label: '% con stock', value: `${pctConStock}%` },
            { label: 'Proveedor principal', value: proveedorPrincipal },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{kpi.label}</p>
              <p className="text-xl font-bold mt-1 truncate" style={{ color: '#185FA5' }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por estado de stock</h3>
            <StockByStatusChart />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 10 proveedores por unidades</h3>
            <StockByProveedorChart />
          </div>
        </div>

        {/* Referencias por categoría */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Referencias por categoría</h3>
          <StockByCategoriaChart />
        </div>

        {/* Alertas de obsolescencia */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Referencias con fecha de recuento obsoleta (+2 años)</h3>
          <ObsoleteAlert />
        </div>
      </div>
    </div>
  )
}
