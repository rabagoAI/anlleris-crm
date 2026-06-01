import { AlertTriangle, X } from 'lucide-react'
import type { Producto } from '../../types'

interface DeleteConfirmModalProps {
  producto: Producto
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({ producto, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Eliminar referencia</h2>
            <p className="text-sm text-gray-600 mt-1">
              ¿Seguro que quieres eliminar esta referencia? Esta acción no se puede deshacer.
            </p>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p className="font-medium text-gray-800">{producto.refCatalysis}</p>
              <p className="text-gray-500 mt-0.5">{producto.descripcion}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
