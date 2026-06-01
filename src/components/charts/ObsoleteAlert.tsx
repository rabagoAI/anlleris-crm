import { CheckCircle, AlertTriangle } from 'lucide-react'
import { useInventoryStore } from '../../store/inventoryStore'
import { isObsolete } from '../../types'

export default function ObsoleteAlert() {
  const productos = useInventoryStore((s) => s.productos)
  const obsoletas = productos.filter((p) => isObsolete(p.fechaRecuento))

  if (obsoletas.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
        <CheckCircle size={18} />
        <span>No hay referencias con fecha de recuento obsoleta. ¡Todo al día!</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-sm text-orange-700">
        <AlertTriangle size={16} />
        <span className="font-medium">{obsoletas.length} referencia{obsoletas.length !== 1 ? 's' : ''} con recuento anterior a 2 años</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium text-gray-600">Ref. Catalysis</th>
              <th className="px-3 py-2 font-medium text-gray-600">Descripción</th>
              <th className="px-3 py-2 font-medium text-gray-600">Proveedor</th>
              <th className="px-3 py-2 font-medium text-gray-600">F. Recuento</th>
              <th className="px-3 py-2 font-medium text-gray-600 text-right">Unidades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {obsoletas.map((p) => (
              <tr key={p.id} className="hover:bg-orange-50">
                <td className="px-3 py-2 font-medium text-gray-800">{p.refCatalysis}</td>
                <td className="px-3 py-2 text-gray-600 max-w-xs truncate" title={p.descripcion}>{p.descripcion}</td>
                <td className="px-3 py-2 text-gray-600">{p.proveedor}</td>
                <td className="px-3 py-2 text-orange-600 font-medium">{p.fechaRecuento}</td>
                <td className="px-3 py-2 text-right text-gray-700">{p.unidades.toLocaleString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
