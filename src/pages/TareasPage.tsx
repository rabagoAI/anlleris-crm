import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import TareaModal from '../components/tareas/TareaModal'
import { useInventoryStore } from '../store/inventoryStore'
import type { Tarea, EstadoTarea, PrioridadTarea } from '../types'

interface TareasPageProps {
  onToast: (msg: string) => void
}

// ── Configuraciones de display ────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoTarea, { label: string; icon: React.ReactNode; headerClass: string }> = {
  pendiente:  { label: 'Pendiente',  icon: <Circle size={15} />,        headerClass: 'bg-gray-100 text-gray-600' },
  en_curso:   { label: 'En curso',   icon: <Clock size={15} />,          headerClass: 'bg-blue-100 text-blue-700' },
  completada: { label: 'Completada', icon: <CheckCircle2 size={15} />,   headerClass: 'bg-green-100 text-green-700' },
}

const PRIORIDAD_CONFIG: Record<PrioridadTarea, { label: string; dotClass: string; badgeClass: string }> = {
  alta:  { label: 'Alta',  dotClass: 'bg-red-500',    badgeClass: 'bg-red-100 text-red-700' },
  media: { label: 'Media', dotClass: 'bg-yellow-400', badgeClass: 'bg-yellow-100 text-yellow-700' },
  baja:  { label: 'Baja',  dotClass: 'bg-gray-300',   badgeClass: 'bg-gray-100 text-gray-500' },
}

const ESTADOS: EstadoTarea[] = ['pendiente', 'en_curso', 'completada']
const SIGUIENTE_ESTADO: Record<EstadoTarea, EstadoTarea> = {
  pendiente: 'en_curso',
  en_curso: 'completada',
  completada: 'pendiente',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esVencida(t: Tarea): boolean {
  if (!t.fechaVencimiento || t.estado === 'completada') return false
  const [d, m, y] = t.fechaVencimiento.split('/')
  if (!d || !m || !y) return false
  return new Date(Number(y), Number(m) - 1, Number(d)) < new Date()
}

// ── Componente tarjeta ────────────────────────────────────────────────────────

function TareaCard({
  tarea,
  onEdit,
  onDelete,
  onCambiarEstado,
}: {
  tarea: Tarea
  onEdit: () => void
  onDelete: () => void
  onCambiarEstado: () => void
}) {
  const cfg = PRIORIDAD_CONFIG[tarea.prioridad]
  const vencida = esVencida(tarea)

  return (
    <div className={`bg-white border rounded-xl p-4 space-y-2 shadow-sm hover:shadow-md transition-shadow ${
      vencida ? 'border-red-300' : 'border-gray-200'
    }`}>
      {/* Cabecera: prioridad + acciones */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
          {cfg.label}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Título */}
      <p className={`text-sm font-medium leading-snug ${
        tarea.estado === 'completada' ? 'line-through text-gray-400' : 'text-gray-800'
      }`}>
        {tarea.titulo}
      </p>

      {/* Descripción */}
      {tarea.descripcion && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tarea.descripcion}</p>
      )}

      {/* Referencia asociada */}
      {tarea.refCatalysis && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium">{tarea.refCatalysis}</span>
          {tarea.proveedor && <span className="text-gray-400">{tarea.proveedor}</span>}
        </div>
      )}

      {/* Pie: vencimiento + botón avanzar estado */}
      <div className="flex items-center justify-between pt-1">
        {tarea.fechaVencimiento ? (
          <span className={`flex items-center gap-1 text-xs ${vencida ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {vencida && <AlertCircle size={12} />}
            {tarea.fechaVencimiento}
          </span>
        ) : <span />}

        <button
          onClick={onCambiarEstado}
          title={`Pasar a: ${ESTADO_CONFIG[SIGUIENTE_ESTADO[tarea.estado]].label}`}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
            tarea.estado === 'completada'
              ? 'border-gray-200 text-gray-400 hover:text-gray-600'
              : 'border-blue-200 text-blue-600 hover:bg-blue-50'
          }`}
        >
          {ESTADO_CONFIG[SIGUIENTE_ESTADO[tarea.estado]].icon}
          <span>{ESTADO_CONFIG[SIGUIENTE_ESTADO[tarea.estado]].label}</span>
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function TareasPage({ onToast }: TareasPageProps) {
  const tareas = useInventoryStore((s) => s.tareas)
  const addTarea = useInventoryStore((s) => s.addTarea)
  const updateTarea = useInventoryStore((s) => s.updateTarea)
  const deleteTarea = useInventoryStore((s) => s.deleteTarea)
  const cambiarEstadoTarea = useInventoryStore((s) => s.cambiarEstadoTarea)

  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Tarea | null>(null)
  const [eliminando, setEliminando] = useState<Tarea | null>(null)
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | ''>('')

  const tareasFiltradas = useMemo(() =>
    filtroPrioridad ? tareas.filter((t) => t.prioridad === filtroPrioridad) : tareas,
    [tareas, filtroPrioridad]
  )

  const porEstado = (estado: EstadoTarea) =>
    tareasFiltradas
      .filter((t) => t.estado === estado)
      .sort((a, b) => {
        // Alta primero, luego media, luego baja; dentro del mismo, más reciente arriba
        const p = { alta: 0, media: 1, baja: 2 }
        return p[a.prioridad] - p[b.prioridad] || b.fechaCreacion.localeCompare(a.fechaCreacion)
      })

  // KPIs
  const pendientes = tareas.filter((t) => t.estado === 'pendiente').length
  const enCurso = tareas.filter((t) => t.estado === 'en_curso').length
  const completadas = tareas.filter((t) => t.estado === 'completada').length
  const vencidas = tareas.filter(esVencida).length

  function handleSave(t: Tarea) {
    if (editando) {
      updateTarea(t)
      onToast('Tarea actualizada.')
    } else {
      addTarea(t)
      onToast('Tarea creada.')
    }
    setShowModal(false)
    setEditando(null)
  }

  function handleDelete() {
    if (!eliminando) return
    deleteTarea(eliminando.id)
    onToast('Tarea eliminada.')
    setEliminando(null)
  }

  function handleCambiarEstado(t: Tarea) {
    const siguiente = SIGUIENTE_ESTADO[t.estado]
    cambiarEstadoTarea(t.id, siguiente)
    if (siguiente === 'completada') onToast(`"${t.titulo}" marcada como completada.`)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Panel de tareas"
        actions={
          <button
            onClick={() => { setEditando(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#185FA5' }}
          >
            <Plus size={16} />
            Nueva tarea
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pendientes',  value: pendientes,  color: '#6b7280' },
            { label: 'En curso',    value: enCurso,     color: '#185FA5' },
            { label: 'Completadas', value: completadas, color: '#16a34a' },
            { label: 'Vencidas',    value: vencidas,    color: '#dc2626' },
          ].map((k) => (
            <div key={k.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{k.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filtro prioridad */}
        <div className="flex items-center gap-2">
          {(['', 'alta', 'media', 'baja'] as (PrioridadTarea | '')[]).map((p) => {
            const label = p === '' ? 'Todas' : PRIORIDAD_CONFIG[p as PrioridadTarea].label
            const active = filtroPrioridad === p
            return (
              <button
                key={p}
                onClick={() => setFiltroPrioridad(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  active ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                style={active ? { backgroundColor: '#185FA5' } : {}}
              >
                {label}
              </button>
            )
          })}
          <span className="text-xs text-gray-400 ml-auto">{tareasFiltradas.length} tarea{tareasFiltradas.length !== 1 ? 's' : ''}</span>
        </div>

        {tareas.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 text-sm">
            Crea tu primera tarea con el botón "Nueva tarea".<br />
            <span className="text-xs mt-1 block">Puedes asociarlas a referencias del inventario.</span>
          </div>
        ) : (
          /* Kanban: 3 columnas */
          <div className="grid grid-cols-3 gap-5">
            {ESTADOS.map((estado) => {
              const col = porEstado(estado)
              const cfg = ESTADO_CONFIG[estado]
              return (
                <div key={estado}>
                  {/* Cabecera columna */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${cfg.headerClass}`}>
                    {cfg.icon}
                    <span className="text-sm font-semibold">{cfg.label}</span>
                    <span className="ml-auto text-xs font-bold">{col.length}</span>
                  </div>

                  {/* Tarjetas */}
                  <div className="space-y-3 min-h-[60px]">
                    {col.map((t) => (
                      <TareaCard
                        key={t.id}
                        tarea={t}
                        onEdit={() => { setEditando(t); setShowModal(true) }}
                        onDelete={() => setEliminando(t)}
                        onCambiarEstado={() => handleCambiarEstado(t)}
                      />
                    ))}
                    {col.length === 0 && (
                      <p className="text-xs text-gray-300 text-center py-4">Sin tareas</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <TareaModal
          mode={editando ? 'edit' : 'create'}
          tarea={editando ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditando(null) }}
        />
      )}

      {/* Modal confirmar eliminar */}
      {eliminando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Eliminar tarea</h2>
            <p className="text-sm text-gray-600 mb-1">¿Eliminar la tarea <strong>"{eliminando.titulo}"</strong>?</p>
            <p className="text-xs text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEliminando(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
