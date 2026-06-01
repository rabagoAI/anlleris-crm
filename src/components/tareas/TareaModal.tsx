import { useState } from 'react'
import { X } from 'lucide-react'
import { useInventoryStore } from '../../store/inventoryStore'
import type { Tarea, PrioridadTarea } from '../../types'

interface TareaModalProps {
  mode: 'create' | 'edit'
  tarea?: Tarea
  /** refCatalysis pre-rellenada al abrir desde la tabla de inventario */
  refInicial?: string
  onSave: (t: Tarea) => void
  onClose: () => void
}

const emptyForm = (refInicial?: string): Omit<Tarea, 'id' | 'fechaCreacion'> => ({
  titulo: '',
  descripcion: '',
  refCatalysis: refInicial ?? '',
  proveedor: '',
  prioridad: 'media',
  estado: 'pendiente',
  fechaVencimiento: '',
})

const PRIORIDADES: { value: PrioridadTarea; label: string }[] = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
]

export default function TareaModal({ mode, tarea, refInicial, onSave, onClose }: TareaModalProps) {
  const productos = useInventoryStore((s) => s.productos)

  const [form, setForm] = useState<Omit<Tarea, 'id' | 'fechaCreacion'>>(
    mode === 'edit' && tarea
      ? { titulo: tarea.titulo, descripcion: tarea.descripcion, refCatalysis: tarea.refCatalysis, proveedor: tarea.proveedor, prioridad: tarea.prioridad, estado: tarea.estado, fechaVencimiento: tarea.fechaVencimiento }
      : emptyForm(refInicial)
  )
  const [errorTitulo, setErrorTitulo] = useState('')

  // Cuando cambia la ref, rellenar proveedor automáticamente
  function handleRefChange(ref: string) {
    const prod = productos.find((p) => p.refCatalysis === ref)
    setForm((f) => ({ ...f, refCatalysis: ref, proveedor: prod?.proveedor ?? f.proveedor }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setErrorTitulo('El título es obligatorio.'); return }
    setErrorTitulo('')
    const saved: Tarea = {
      id: mode === 'edit' && tarea ? tarea.id : crypto.randomUUID(),
      fechaCreacion: mode === 'edit' && tarea ? tarea.fechaCreacion : new Date().toISOString(),
      ...form,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion?.trim() || undefined,
      refCatalysis: form.refCatalysis?.trim() || undefined,
      proveedor: form.proveedor?.trim() || undefined,
      fechaVencimiento: form.fechaVencimiento?.trim() || undefined,
      fechaCompletada: mode === 'edit' ? tarea?.fechaCompletada : undefined,
    }
    onSave(saved)
  }

  const refs = [...new Set(productos.map((p) => p.refCatalysis))].sort()
  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? 'Nueva tarea' : 'Editar tarea'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className={labelClass}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              className={`${inputClass} ${errorTitulo ? 'border-red-400' : ''}`}
              placeholder="Ej: Revisar lote caducado, Devolver a proveedor…"
              autoFocus
            />
            {errorTitulo && <p className="text-xs text-red-500 mt-1">{errorTitulo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              rows={2}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              className={`${inputClass} resize-none`}
              placeholder="Detalles adicionales…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div>
              <label className={labelClass}>Prioridad</label>
              <select
                value={form.prioridad}
                onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as PrioridadTarea }))}
                className={inputClass}
              >
                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Fecha vencimiento */}
            <div>
              <label className={labelClass}>Fecha límite</label>
              <input
                type="text"
                value={form.fechaVencimiento ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, fechaVencimiento: e.target.value }))}
                className={inputClass}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          {/* Referencia asociada */}
          <div>
            <label className={labelClass}>
              Referencia asociada
              <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              list="refs-tareas-list"
              value={form.refCatalysis ?? ''}
              onChange={(e) => handleRefChange(e.target.value)}
              className={inputClass}
              placeholder="Busca por ref. Catalysis…"
            />
            <datalist id="refs-tareas-list">
              {refs.map((r) => <option key={r} value={r} />)}
            </datalist>
            {form.proveedor && (
              <p className="text-xs text-gray-400 mt-1">Proveedor: {form.proveedor}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#185FA5' }}>
              {mode === 'create' ? 'Crear tarea' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
