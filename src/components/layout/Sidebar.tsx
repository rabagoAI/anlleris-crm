import { useState } from 'react'
import { Package, BarChart2, Truck, History, BellRing, ShoppingCart, ClipboardList, Menu, X } from 'lucide-react'
import { useInventoryStore, usePedidosActivos, useTareasPendientes } from '../../store/inventoryStore'
import { necesitaReposicion } from '../../types'

type Page = 'inventario' | 'informes' | 'proveedores' | 'movimientos' | 'alertas' | 'pedidos' | 'tareas'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'inventario',  label: 'Inventario',  icon: <Package size={20} /> },
  { id: 'informes',    label: 'Informes',    icon: <BarChart2 size={20} /> },
  { id: 'proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
  { id: 'pedidos',     label: 'Pedidos',     icon: <ShoppingCart size={20} /> },
  { id: 'tareas',      label: 'Tareas',      icon: <ClipboardList size={20} /> },
  { id: 'movimientos', label: 'Movimientos', icon: <History size={20} /> },
  { id: 'alertas',     label: 'Alertas',     icon: <BellRing size={20} /> },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const totalMovimientos = useInventoryStore((s) => s.movimientos.length)
  const totalAlertas = useInventoryStore((s) => s.productos.filter(necesitaReposicion).length)
  const pedidosActivos = usePedidosActivos()
  const tareasPendientes = useTareasPendientes()
  const [open, setOpen] = useState(false)

  function handleNavigate(page: Page) {
    onNavigate(page)
    setOpen(false)
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold tracking-wide" style={{ color: '#185FA5' }}>
            ANLLERIS
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Gestión de Stock</p>
        </div>
        {/* Botón cerrar en móvil */}
        <button
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = currentPage === item.id
          const badgeCount =
            item.id === 'movimientos' ? totalMovimientos :
            item.id === 'alertas'     ? totalAlertas :
            item.id === 'pedidos'     ? pedidosActivos :
            item.id === 'tareas'      ? tareasPendientes :
            0
          const badgeRed    = item.id === 'alertas'
          const badgeOrange = item.id === 'pedidos'
          const badgePurple = item.id === 'tareas'

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={active ? { backgroundColor: '#185FA5' } : {}}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    active
                      ? 'bg-white/20 text-white'
                      : badgeRed
                      ? 'bg-red-100 text-red-600'
                      : badgeOrange
                      ? 'bg-orange-100 text-orange-600'
                      : badgePurple
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Versión */}
      <div className="px-5 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">v1.0 · RABAGO AI</p>
      </div>
    </>
  )

  return (
    <>
      {/* Botón hamburguesa — solo móvil */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Overlay fondo — móvil */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar móvil — drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white flex flex-col shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Sidebar desktop — fijo */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r border-gray-200 flex-col shrink-0">
        {navContent}
      </aside>
    </>
  )
}
