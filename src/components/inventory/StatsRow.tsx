import { useInventoryStore } from '../../store/inventoryStore'
import { getStockStatus } from '../../types'

interface StatCardProps {
  label: string
  value: string | number
  color?: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color ?? '#185FA5' }}>
        {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
      </p>
    </div>
  )
}

export default function StatsRow() {
  const productos = useInventoryStore((s) => s.productos)

  const total = productos.length
  const conStock = productos.filter((p) => getStockStatus(p.unidades) === 'con_stock').length
  const sinStock = productos.filter((p) => getStockStatus(p.unidades) === 'sin_stock').length
  const stockBajo = productos.filter((p) => getStockStatus(p.unidades) === 'stock_bajo').length
  const proveedoresUnicos = new Set(productos.map((p) => p.proveedor)).size

  return (
    <div className="flex gap-4">
      <StatCard label="Total referencias" value={total} />
      <StatCard label="Con stock" value={conStock} color="#16a34a" />
      <StatCard label="Stock bajo" value={stockBajo} color="#ea580c" />
      <StatCard label="Sin stock" value={sinStock} color="#dc2626" />
      <StatCard label="Proveedores" value={proveedoresUnicos} color="#7c3aed" />
    </div>
  )
}
