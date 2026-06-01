import { useState, useEffect, useMemo } from 'react'
import { Pencil, Trash2, BellRing, ClipboardList, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useInventoryStore, useProductosFiltrados } from '../../store/inventoryStore'
import { getStockStatus, necesitaReposicion } from '../../types'
import type { Producto } from '../../types'
import ProductModal from './ProductModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import TareaModal from '../tareas/TareaModal'

interface InventoryTableProps {
  onToast: (msg: string) => void
}

const PAGE_SIZE = 25

type SortField = keyof Producto | 'estado'
type SortDir = 'asc' | 'desc'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  con_stock: { label: 'Con stock', className: 'bg-green-100 text-green-700' },
  stock_bajo: { label: 'Stock bajo', className: 'bg-orange-100 text-orange-700' },
  sin_stock: { label: 'Sin stock', className: 'bg-red-100 text-red-700' },
}

// Convierte DD/MM/YYYY a número comparable (YYYYMMDD), o 0 si vacío
function dateToNum(d?: string): number {
  if (!d) return 0
  const [day, month, year] = d.split('/')
  return parseInt(`${year}${month}${day}`, 10)
}

// Valor numérico del estado para ordenar: sin_stock < stock_bajo < con_stock
const STATUS_ORDER: Record<string, number> = { sin_stock: 0, stock_bajo: 1, con_stock: 2 }

function sortProductos(productos: Producto[], field: SortField, dir: SortDir): Producto[] {
  return [...productos].sort((a, b) => {
    let cmp = 0

    if (field === 'estado') {
      cmp = STATUS_ORDER[getStockStatus(a.unidades)] - STATUS_ORDER[getStockStatus(b.unidades)]
    } else if (field === 'unidades' || field === 'stockMinimo') {
      cmp = (a[field] ?? 0) - (b[field] ?? 0)
    } else if (field === 'fechaRecuento' || field === 'fechaUtilizacion') {
      cmp = dateToNum(a[field]) - dateToNum(b[field])
    } else {
      const av = (a[field] ?? '') as string
      const bv = (b[field] ?? '') as string
      cmp = av.localeCompare(bv, 'es', { sensitivity: 'base' })
    }

    return dir === 'asc' ? cmp : -cmp
  })
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown size={13} className="text-gray-300 ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-blue-600 ml-1 inline" />
    : <ChevronDown size={13} className="text-blue-600 ml-1 inline" />
}

export default function InventoryTable({ onToast }: InventoryTableProps) {
  const productos = useProductosFiltrados()
  const updateProducto = useInventoryStore((s) => s.updateProducto)
  const deleteProducto = useInventoryStore((s) => s.deleteProducto)
  const addTarea = useInventoryStore((s) => s.addTarea)

  const [editando, setEditando] = useState<Producto | null>(null)
  const [eliminando, setEliminando] = useState<Producto | null>(null)
  const [nuevaTareaRef, setNuevaTareaRef] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  // Resetear página al cambiar filtros o columna de orden
  useEffect(() => { setPage(1) }, [productos.length, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(
    () => sortField ? sortProductos(productos, sortField, sortDir) : productos,
    [productos, sortField, sortDir]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pagina = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

  const thClass = 'px-4 py-3 font-medium text-gray-600 whitespace-nowrap select-none cursor-pointer hover:text-gray-900 hover:bg-gray-100 transition-colors'
  const thClassRight = thClass + ' text-right'

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
                <th className={thClass} onClick={() => handleSort('refCatalysis')}>
                  Ref. Catalysis <SortIcon field="refCatalysis" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('refProveedor')}>
                  Ref. Proveedor <SortIcon field="refProveedor" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('descripcion')}>
                  Descripción <SortIcon field="descripcion" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClassRight} onClick={() => handleSort('unidades')}>
                  Unidades <SortIcon field="unidades" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClassRight} onClick={() => handleSort('stockMinimo')}>
                  Mín. <SortIcon field="stockMinimo" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('unidadMedida')}>
                  U. Medida <SortIcon field="unidadMedida" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('proveedor')}>
                  Proveedor <SortIcon field="proveedor" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('categoria')}>
                  Categoría <SortIcon field="categoria" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('fechaRecuento')}>
                  F. Recuento <SortIcon field="fechaRecuento" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('fechaUtilizacion')}>
                  F. Utilización <SortIcon field="fechaUtilizacion" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort('estado')}>
                  Estado <SortIcon field="estado" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagina.map((p) => {
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
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{p.fechaUtilizacion ?? '—'}</td>
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

        {/* Pie: contador + paginación */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-gray-400">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} de {sorted.length} referencia{sorted.length !== 1 ? 's' : ''}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .reduce<(number | '...')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-300">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`min-w-[28px] px-2 py-1 text-xs rounded-lg border transition-colors ${
                        page === n
                          ? 'border-blue-600 text-white font-medium'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                      style={page === n ? { backgroundColor: '#185FA5' } : undefined}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          )}
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
