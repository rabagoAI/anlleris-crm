import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useInventoryStore } from '../../store/inventoryStore'

const COLORS = ['#185FA5', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#7c3aed', '#a78bfa']

export default function StockByCategoriaChart() {
  const productos = useInventoryStore((s) => s.productos)

  const conCategoria = productos.filter((p) => p.categoria)
  if (conCategoria.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm text-center px-4">
        Aún no hay categorías asignadas.<br />
        Edita referencias desde Inventario para clasificarlas.
      </div>
    )
  }

  const mapa = new Map<string, { refs: number; unidades: number }>()
  for (const p of conCategoria) {
    const cat = p.categoria!
    const entry = mapa.get(cat) ?? { refs: 0, unidades: 0 }
    entry.refs += 1
    entry.unidades += p.unidades
    mapa.set(cat, entry)
  }

  const data = [...mapa.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.refs - a.refs)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 16 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          formatter={(v, name) => [
            Number(v).toLocaleString('es-ES'),
            name === 'refs' ? 'Referencias' : 'Unidades',
          ]}
        />
        <Bar dataKey="refs" name="refs" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
