import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import StatsRow from '../components/inventory/StatsRow'
import FilterBar from '../components/inventory/FilterBar'
import InventoryTable from '../components/inventory/InventoryTable'
import ImportExcel from '../components/import-export/ImportExcel'
import ExportButtons from '../components/import-export/ExportButtons'
import ProductModal from '../components/inventory/ProductModal'
import { useInventoryStore } from '../store/inventoryStore'
import type { Producto } from '../types'

interface InventarioPageProps {
  onToast: (msg: string) => void
}

export default function InventarioPage({ onToast }: InventarioPageProps) {
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(true)
  const addProducto = useInventoryStore((s) => s.addProducto)
  const totalProductos = useInventoryStore((s) => s.productos.length)

  // Colapsar zona de importación cuando ya hay datos
  const hayDatos = totalProductos > 0

  function handleSave(p: Producto) {
    addProducto(p)
    setShowModal(false)
    onToast('Referencia añadida correctamente.')
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Inventario de Stock"
        actions={
          <>
            <ExportButtons onToast={onToast} />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#185FA5' }}
            >
              <Plus size={16} />
              Nueva referencia
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <StatsRow />

        {/* Importar Excel — colapsable si ya hay datos */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowImport((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Importar Excel</span>
            {showImport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showImport && (
            <div className="p-4 pt-0">
              <ImportExcel
                onToast={(msg) => {
                  onToast(msg)
                  if (hayDatos) setShowImport(false)
                }}
              />
            </div>
          )}
        </div>

        {/* Filtros */}
        {hayDatos && <FilterBar />}

        {/* Tabla */}
        {hayDatos ? (
          <InventoryTable onToast={onToast} />
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 text-sm">
            Importa un Excel para ver las referencias de stock aquí.
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal mode="create" onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
