import { useState } from 'react'
import { X } from 'lucide-react'
import type { Producto } from '../../types'
import { useInventoryStore } from '../../store/inventoryStore'

interface ProductModalProps {
  mode: 'create' | 'edit'
  producto?: Producto
  onSave: (p: Producto) => void
  onClose: () => void
}

const UNIDADES_MEDIDA = ['1 UND', 'CAJA', 'PAQUETE', 'ROLLO', 'KG', 'L', 'M']

const emptyForm = (): Omit<Producto, 'id'> => ({
  refCatalysis: '',
  refProveedor: '',
  descripcion: '',
  unidades: 0,
  unidadMedida: '1 UND',
  stockMinimo: undefined,
  proveedor: '',
  categoria: '',
  fechaRecuento: '',
  fechaUtilizacion: '',
  notas: '',
})

export default function ProductModal({ mode, producto, onSave, onClose }: ProductModalProps) {
  const productos = useInventoryStore((s) => s.productos)
  const proveedoresExistentes = [...new Set(productos.map((p) => p.proveedor))].filter(Boolean).sort()
  const categoriasExistentes = [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort() as string[]

  const [form, setForm] = useState<Omit<Producto, 'id'>>(
    mode === 'edit' && producto
      ? { ...producto }
      : emptyForm()
  )
  const [errores, setErrores] = useState<Partial<Record<keyof Producto, string>>>({})

  const set = (field: keyof typeof form, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  function validar(): boolean {
    const e: Partial<Record<keyof Producto, string>> = {}
    if (!form.refCatalysis.trim()) e.refCatalysis = 'La referencia Catalysis es obligatoria.'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria.'
    if (form.unidades < 0) e.unidades = 'Las unidades no pueden ser negativas.'
    if (!form.proveedor.trim()) e.proveedor = 'El proveedor es obligatorio.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    const saved: Producto = {
      id: mode === 'edit' && producto ? producto.id : crypto.randomUUID(),
      ...form,
      refProveedor: form.refProveedor?.trim() || undefined,
      categoria: form.categoria?.trim() || undefined,
      fechaRecuento: form.fechaRecuento?.trim() || undefined,
      fechaUtilizacion: form.fechaUtilizacion?.trim() || undefined,
      notas: form.notas?.trim() || undefined,
    }
    onSave(saved)
  }

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const inputClass = (err?: string) =>
    `w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      err ? 'border-red-400' : 'border-gray-200'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? 'Nueva referencia' : 'Editar referencia'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Ref. Catalysis */}
            <div>
              <label className={labelClass}>Ref. Catalysis <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.refCatalysis}
                onChange={(e) => set('refCatalysis', e.target.value)}
                className={inputClass(errores.refCatalysis)}
                placeholder="Ej: 7004"
              />
              {errores.refCatalysis && <p className="text-xs text-red-500 mt-1">{errores.refCatalysis}</p>}
            </div>

            {/* Ref. Proveedor */}
            <div>
              <label className={labelClass}>Ref. Proveedor</label>
              <input
                type="text"
                value={form.refProveedor ?? ''}
                onChange={(e) => set('refProveedor', e.target.value)}
                className={inputClass()}
                placeholder="Opcional"
              />
            </div>

            {/* Descripción (full width) */}
            <div className="col-span-2">
              <label className={labelClass}>Descripción <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                className={inputClass(errores.descripcion)}
                placeholder="Descripción del producto"
              />
              {errores.descripcion && <p className="text-xs text-red-500 mt-1">{errores.descripcion}</p>}
            </div>

            {/* Unidades */}
            <div>
              <label className={labelClass}>Unidades <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={form.unidades}
                onChange={(e) => set('unidades', Number(e.target.value))}
                className={inputClass(errores.unidades)}
              />
              {errores.unidades && <p className="text-xs text-red-500 mt-1">{errores.unidades}</p>}
            </div>

            {/* Unidad de medida */}
            <div>
              <label className={labelClass}>Unidad de medida</label>
              <select
                value={form.unidadMedida}
                onChange={(e) => set('unidadMedida', e.target.value)}
                className={inputClass()}
              >
                {UNIDADES_MEDIDA.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Stock mínimo */}
            <div className="col-span-2">
              <label className={labelClass}>
                Stock mínimo para alerta
                <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={form.stockMinimo ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stockMinimo: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                  className={`${inputClass()} w-40`}
                  placeholder="Ej: 500"
                />
                <p className="text-xs text-gray-400">
                  Si las unidades bajan de este valor, aparecerá en Alertas de reposición.
                </p>
              </div>
            </div>

            {/* Proveedor */}
            <div className="col-span-2">
              <label className={labelClass}>Proveedor <span className="text-red-500">*</span></label>
              <input
                list="proveedores-list"
                value={form.proveedor}
                onChange={(e) => set('proveedor', e.target.value)}
                className={inputClass(errores.proveedor)}
                placeholder="Nombre del proveedor"
              />
              <datalist id="proveedores-list">
                {proveedoresExistentes.map((p) => <option key={p} value={p} />)}
              </datalist>
              {errores.proveedor && <p className="text-xs text-red-500 mt-1">{errores.proveedor}</p>}
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <label className={labelClass}>
                Categoría
                <span className="ml-1 text-xs font-normal text-gray-400">(opcional — ej: Estuches, Frascos, Cajas)</span>
              </label>
              <input
                list="categorias-list"
                value={form.categoria ?? ''}
                onChange={(e) => set('categoria', e.target.value)}
                className={inputClass()}
                placeholder="Escribe o elige una categoría existente"
              />
              <datalist id="categorias-list">
                {categoriasExistentes.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Fecha recuento */}
            <div>
              <label className={labelClass}>Fecha recuento</label>
              <input
                type="text"
                value={form.fechaRecuento ?? ''}
                onChange={(e) => set('fechaRecuento', e.target.value)}
                className={inputClass()}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Fecha utilización */}
            <div>
              <label className={labelClass}>Fecha utilización</label>
              <input
                type="text"
                value={form.fechaUtilizacion ?? ''}
                onChange={(e) => set('fechaUtilizacion', e.target.value)}
                className={inputClass()}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className={labelClass}>Notas</label>
              <textarea
                rows={2}
                value={form.notas ?? ''}
                onChange={(e) => set('notas', e.target.value)}
                className={`${inputClass()} resize-none`}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#185FA5' }}
            >
              {mode === 'create' ? 'Guardar referencia' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
