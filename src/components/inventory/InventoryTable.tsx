import { useState } from 'react'
import { Pencil, Trash2, BellRing, ClipboardList } from 'lucide-react'
import { useInventoryStore, useProductosFiltrados } from '../../store/inventoryStore'
import { getStockStatus, necesitaReposicion } from '../../types'
import type { Producto } from '../../types'
import ProductModal from './ProductModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import TareaModal from '../tareas/TareaModal'

interface InventoryTableProps {
  onToast: (msg: string) => void
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  con_stock: { label: 'Con stock', className: 'bg-green-100 text-green-700' },
  stock_bajo: { label: 'Stock bajo', className: 'bg-orange-100 text-orange-700' },
  sin_stock: { label: 'Sin stock', className: 'bg-red-100 text-red-700' },
}

export default function InventoryTable({ onToast }: InventoryTableProps) {
  const productos = useProductosFiltrados()
  const updateProducto = useInventoryStore((s) => s.updateProducto)
  const deleteProducto = useInventoryStore((s) => s.deleteProducto)
  const addTarea = useInventoryStore((s) => s.addTarea)

  const [editando, setEditando] = useState<Producto | null>(null)
  const [eliminando, setEliminando] = useState<Producto | null>(null)
  const [nuevaTareaRef, setNuevaTareaRef] = useState<string | null>(null)

  function handleSave(p: Producto) {
    updateProducto(p)
    setEditando(null)
    onToast('Referencia actualizada correctamente.')
  }

  function handleDelete() {
    if (!eliminando) return
    deleteProducto(eliminando.id)
    setEliminando(null)
    onToast('Referencia eliminada.')
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
        No hay referencias que coincidan con los filtros.
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ref. Catalysis</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ref. Proveedor</th>
                <th className="px-4 py-3 font-medium text-gray-600">Descripción</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Unidades</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Mín.</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">U. Medida</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Proveedor</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Categoría</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">F. Recuento</th>
                <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((p) => {
                const status = getStockStatus(p.unidades)
                const badge = STATUS_BADGE[status]
                const alerta = necesitaReposicion(p)
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${alerta ? 'bg-orange-50/40' : ''}`}>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {alerta && (
                          <BellRing size={13} className="text-orange-500 shrink-0" aria-label="Necesita reposición" />
                        )}
                        <span className="font-medium text-gray-800">{p.refCatalysis}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{p.refProveedor ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700 max-w-xs truncate" title={p.descripcion}>{p.descripcion}</td>
                    <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${alerta ? 'text-orange-600' : 'text-gray-800'}`}>
                      {p.unidades.toLocaleString('es-ES')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-400 text-xs whitespace-nowrap">
                      {p.stockMinimo !== undefined ? p.stockMinimo.toLocaleString('es-ES') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{p.unidadMedida}</td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{p.proveedor}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {p.categoria ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {p.categoria}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{p.fechaRecuento ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditando(p)}
                          title="Editar"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setNuevaTareaRef(p.refCatalysis)}
                          title="Nueva tarea"
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <ClipboardList size={15} />
                        </button>
                        <button
                          onClick={() => setEliminando(p)}
                          title="Eliminar"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
          {productos.length} referencia{productos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {editando && (
        <ProductModal
          mode="edit"
          producto={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
        />
      )}

      {eliminando && (
        <DeleteConfirmModal
          producto={eliminando}
          onConfirm={handleDelete}
          onCancel={() => setEliminando(null)}
        />
      )}

      {nuevaTareaRef !== null && (
        <TareaModal
          mode="create"
          refInicial={nuevaTareaRef}
          onSave={(t) => {
            addTarea(t)
            setNuevaTareaRef(null)
            onToast('Tarea creada.')
          }}
          onClose={() => setNuevaTareaRef(null)}
        />
      )}
    </>
  )
}
