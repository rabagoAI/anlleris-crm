import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useInventoryStore } from '../../store/inventoryStore'

export default function StockByProveedorChart() {
  const productos = useInventoryStore((s) => s.productos)

  // Agrupar unidades por proveedor y tomar top 10
  const mapa = new Map<string, number>()
  for (const p of productos) {
    mapa.set(p.proveedor, (mapa.get(p.proveedor) ?? 0) + p.unidades)
  }
  const data = [...mapa.entries()]
    .map(([name, unidades]) => ({ name, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 10)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => v.toLocaleString('es-ES')}
        />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
        <Tooltip
          formatter={(v) => [`${Number(v).toLocaleString('es-ES')} uds.`, 'Unidades']}
        />
        <Bar dataKey="unidades" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#185FA5' : '#93c5fd'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
