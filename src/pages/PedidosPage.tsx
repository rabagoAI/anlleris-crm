import { useState, useMemo } from 'react'
import { Plus, PackageCheck, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import NuevoPedidoModal from '../components/pedidos/NuevoPedidoModal'
import RecepcionModal from '../components/pedidos/RecepcionModal'
import { useInventoryStore } from '../store/inventoryStore'
import type { Pedido, EstadoPedido, LineaPedido } from '../types'

interface PedidosPageProps {
  onToast: (msg: string) => void
}

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente',  className: 'bg-blue-100 text-blue-700' },
  parcial:   { label: 'Parcial',    className: 'bg-yellow-100 text-yellow-700' },
  recibido:  { label: 'Recibido',   className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado',  className: 'bg-gray-100 text-gray-500' },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function PedidosPage({ onToast }: PedidosPageProps) {
  const pedidos = useInventoryStore((s) => s.pedidos)
  const addPedido = useInventoryStore((s) => s.addPedido)
  const cancelarPedido = useInventoryStore((s) => s.cancelarPedido)
  const recibirPedido = useInventoryStore((s) => s.recibirPedido)

  const [showNuevo, setShowNuevo] = useState(false)
  const [recepcionando, setRecepcionando] = useState<Pedido | null>(null)
  const [cancelando, setCancelando] = useState<Pedido | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('')

  const pedidosFiltrados = useMemo(() =>
    filtroEstado ? pedidos.filter((p) => p.estado === filtroEstado) : pedidos,
    [pedidos, filtroEstado]
  )

  // KPIs
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length
  const parciales = pedidos.filter((p) => p.estado === 'parcial').length
  const recibidos = pedidos.filter((p) => p.estado === 'recibido').length

  function handleCrear(p: Pedido) {
    addPedido(p)
    setShowNuevo(false)
    onToast(`Pedido ${p.numeroPedido} creado correctamente.`)
  }

  function handleRecibir(lineas: LineaPedido[]) {
    if (!recepcionando) return
    recibirPedido(recepcionando.id, lineas)
    const total = lineas.reduce((s, l) => s + l.unidadesRecibidas, 0)
    onToast(`Pedido ${recepcionando.numeroPedido} recepcionado — +${total.toLocaleString('es-ES')} uds. añadidas al stock.`)
    setRecepcionando(null)
  }

  function handleCancelar() {
    if (!cancelando) return
    cancelarPedido(cancelando.id)
    onToast(`Pedido ${cancelando.numeroPedido} cancelado.`)
    setCancelando(null)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Pedidos a proveedor"
        actions={
          <button
            onClick={() => setShowNuevo(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#185FA5' }}
          >
            <Plus size={16} />
            Nuevo pedido
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total pedidos',   value: pedidos.length,  color: '#185FA5' },
            { label: 'Pendientes',      value: pendientes,      color: '#2563eb' },
            { label: 'Recepción parcial', value: parciales,     color: '#ea580c' },
            { label: 'Recibidos',       value: recibidos,       color: '#16a34a' },
          ].map((k) => (
            <div key={k.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{k.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filtro estado */}
        <div className="flex items-center gap-3">
          {(['', 'pendiente', 'parcial', 'recibido', 'cancelado'] as (EstadoPedido | '')[]).map((e) => {
            const label = e === '' ? 'Todos' : ESTADO_CONFIG[e as EstadoPedido].label
            const active = filtroEstado === e
            return (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  active
                    ? 'text-white border-transparent'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                style={active ? { backgroundColor: '#185FA5' } : {}}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 text-sm">
            {pedidos.length === 0
              ? 'Crea tu primer pedido con el botón "Nuevo pedido".'
              : 'No hay pedidos con el filtro seleccionado.'}
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => {
              const cfg = ESTADO_CONFIG[pedido.estado]
              const abierto = expandido === pedido.id
              const totalUds = pedido.lineas.reduce((s, l) => s + l.unidadesPedidas, 0)
              const activo = pedido.estado === 'pendiente' || pedido.estado === 'parcial'

              return (
                <div key={pedido.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Cabecera del pedido */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{pedido.numeroPedido}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                        <span className="font-medium text-gray-600">{pedido.proveedor}</span>
                        <span>Creado: {formatFecha(pedido.fechaCreacion)}</span>
                        {pedido.fechaEsperada && <span>Esperado: {pedido.fechaEsperada}</span>}
                        {pedido.fechaRecepcion && <span>Recibido: {formatFecha(pedido.fechaRecepcion)}</span>}
                        <span>{pedido.lineas.length} ref. · {totalUds.toLocaleString('es-ES')} uds.</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      {activo && (
                        <>
                          <button
                            onClick={() => setRecepcionando(pedido)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90"
                            style={{ backgroundColor: '#185FA5' }}
                          >
                            <PackageCheck size={14} />
                            Recepcionar
                          </button>
                          <button
                            onClick={() => setCancelando(pedido)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                            title="Cancelar pedido"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setExpandido(abierto ? null : pedido.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Líneas del pedido (desplegable) */}
                  {abierto && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-5 py-2 text-left font-medium text-gray-500">Ref.</th>
                            <th className="px-5 py-2 text-left font-medium text-gray-500">Descripción</th>
                            <th className="px-5 py-2 text-right font-medium text-gray-500">Pedidas</th>
                            <th className="px-5 py-2 text-right font-medium text-gray-500">Recibidas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {pedido.lineas.map((l) => (
                            <tr key={l.id} className="hover:bg-gray-50">
                              <td className="px-5 py-2 font-medium text-gray-700">{l.refCatalysis}</td>
                              <td className="px-5 py-2 text-gray-500 truncate max-w-xs">{l.descripcion}</td>
                              <td className="px-5 py-2 text-right text-gray-700">
                                {l.unidadesPedidas.toLocaleString('es-ES')} {l.unidadMedida}
                              </td>
                              <td className={`px-5 py-2 text-right font-medium ${
                                l.unidadesRecibidas === l.unidadesPedidas
                                  ? 'text-green-600'
                                  : l.unidadesRecibidas > 0
                                  ? 'text-orange-500'
                                  : 'text-gray-400'
                              }`}>
                                {l.unidadesRecibidas.toLocaleString('es-ES')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {pedido.notas && (
                        <p className="px-5 py-2 text-xs text-gray-400 border-t border-gray-100">
                          Notas: {pedido.notas}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal nuevo pedido */}
      {showNuevo && (
        <NuevoPedidoModal onSave={handleCrear} onClose={() => setShowNuevo(false)} />
      )}

      {/* Modal recepción */}
      {recepcionando && (
        <RecepcionModal
          pedido={recepcionando}
          onConfirmar={handleRecibir}
          onClose={() => setRecepcionando(null)}
        />
      )}

      {/* Modal cancelar */}
      {cancelando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Cancelar pedido</h2>
            <p className="text-sm text-gray-600 mb-1">
              ¿Seguro que quieres cancelar el pedido <strong>{cancelando.numeroPedido}</strong>?
            </p>
            <p className="text-xs text-gray-400 mb-6">El stock no se modificará.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelando(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
