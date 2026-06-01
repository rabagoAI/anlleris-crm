import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { useInventoryStore } from '../../store/inventoryStore'
import { getStockStatus } from '../../types'

const COLORS = ['#16a34a', '#ea580c', '#dc2626']

export default function StockByStatusChart() {
  const productos = useInventoryStore((s) => s.productos)

  const conStock = productos.filter((p) => getStockStatus(p.unidades) === 'con_stock').length
  const stockBajo = productos.filter((p) => getStockStatus(p.unidades) === 'stock_bajo').length
  const sinStock = productos.filter((p) => getStockStatus(p.unidades) === 'sin_stock').length

  const data = [
    { name: 'Con stock', value: conStock },
    { name: 'Stock bajo', value: stockBajo },
    { name: 'Sin stock', value: sinStock },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v} ref.`, '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
