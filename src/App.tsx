import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import InventarioPage from './pages/InventarioPage'
import InformesPage from './pages/InformesPage'
import ProveedoresPage from './pages/ProveedoresPage'
import MovimientosPage from './pages/MovimientosPage'
import AlertasPage from './pages/AlertasPage'
import PedidosPage from './pages/PedidosPage'
import TareasPage from './pages/TareasPage'

type Page = 'inventario' | 'informes' | 'proveedores' | 'movimientos' | 'alertas' | 'pedidos' | 'tareas'

interface ToastItem {
  id: number
  msg: string
}

export default function App() {
  const [page, setPage] = useState<Page>('inventario')
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function addToast(msg: string) {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg }])
  }

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => setToasts((t) => t.slice(1)), 3000)
    return () => clearTimeout(timer)
  }, [toasts])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F9FA' }}>
      <Sidebar currentPage={page} onNavigate={setPage} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {page === 'inventario'  && <InventarioPage onToast={addToast} />}
        {page === 'informes'    && <InformesPage />}
        {page === 'proveedores' && <ProveedoresPage />}
        {page === 'movimientos' && <MovimientosPage />}
        {page === 'alertas'     && <AlertasPage onToast={addToast} />}
        {page === 'pedidos'     && <PedidosPage onToast={addToast} />}
        {page === 'tareas'      && <TareasPage onToast={addToast} />}
      </main>

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 space-y-2 z-[100]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg"
          >
            <CheckCircle size={16} className="text-green-400 shrink-0" />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
