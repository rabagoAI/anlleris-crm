import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { Producto, FiltrosInventario, Movimiento, TipoMovimiento, Pedido, LineaPedido, ResultadoImportacion, Tarea, EstadoTarea } from '../types'

interface InventoryState {
  productos: Producto[]
  filtros: FiltrosInventario
  movimientos: Movimiento[]
  pedidos: Pedido[]
  tareas: Tarea[]
  // Acciones de inventario
  addProducto: (p: Producto) => void
  updateProducto: (p: Producto, notas?: string) => void
  deleteProducto: (id: string) => void
  setProductos: (ps: Producto[]) => void
  /** Importación incremental: actualiza existentes, añade nuevas, conserva el resto */
  mergeProductos: (ps: Producto[]) => ResultadoImportacion
  setFiltros: (f: Partial<FiltrosInventario>) => void
  // Acciones de historial
  clearMovimientos: () => void
  // Acciones de pedidos
  addPedido: (p: Pedido) => void
  cancelarPedido: (id: string) => void
  /** Recepciona un pedido: actualiza unidadesRecibidas en las líneas y suma al stock */
  recibirPedido: (pedidoId: string, lineas: LineaPedido[]) => void
  // Acciones de tareas
  addTarea: (t: Tarea) => void
  updateTarea: (t: Tarea) => void
  deleteTarea: (id: string) => void
  cambiarEstadoTarea: (id: string, estado: EstadoTarea) => void
}

function crearMovimiento(
  tipo: TipoMovimiento,
  p: Producto,
  unidadesAntes: number,
  notas?: string,
): Movimiento {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    tipo,
    refCatalysis: p.refCatalysis,
    descripcion: p.descripcion,
    proveedor: p.proveedor,
    unidadesAntes,
    unidadesDespues: p.unidades,
    diferencia: p.unidades - unidadesAntes,
    notas,
  }
}

/** Genera el siguiente número de pedido en formato P-001 */
function siguienteNumeroPedido(pedidos: Pedido[]): string {
  const max = pedidos.reduce((acc, p) => {
    const n = parseInt(p.numeroPedido.replace('P-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return `P-${String(max + 1).padStart(3, '0')}`
}

export const useInventoryStore = create<InventoryState>()(persist((set, get) => ({
  productos: [],
  filtros: { busqueda: '', proveedor: '', estado: '', categoria: '' },
  movimientos: [],
  pedidos: [],
  tareas: [],

  addProducto: (p) => {
    const mov = crearMovimiento('creacion', p, 0, 'Nueva referencia creada manualmente')
    set((s) => ({
      productos: [...s.productos, p],
      movimientos: [mov, ...s.movimientos],
    }))
  },

  updateProducto: (p, notas) => {
    const anterior = get().productos.find((x) => x.id === p.id)
    const unidadesAntes = anterior?.unidades ?? p.unidades
    const tipo: TipoMovimiento = unidadesAntes !== p.unidades ? 'ajuste' : 'edicion'
    const mov = crearMovimiento(tipo, p, unidadesAntes, notas)
    set((s) => ({
      productos: s.productos.map((x) => (x.id === p.id ? p : x)),
      movimientos: [mov, ...s.movimientos],
    }))
  },

  deleteProducto: (id) => {
    const p = get().productos.find((x) => x.id === id)
    if (!p) return
    const mov = crearMovimiento('eliminacion', { ...p, unidades: 0 }, p.unidades, 'Referencia eliminada')
    set((s) => ({
      productos: s.productos.filter((x) => x.id !== id),
      movimientos: [mov, ...s.movimientos],
    }))
  },

  setProductos: (ps) => {
    const movimientos: Movimiento[] = ps.map((p) => ({
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      tipo: 'importacion' as TipoMovimiento,
      refCatalysis: p.refCatalysis,
      descripcion: p.descripcion,
      proveedor: p.proveedor,
      unidadesAntes: 0,
      unidadesDespues: p.unidades,
      diferencia: p.unidades,
      notas: 'Importación completa desde Excel',
    }))
    set({ productos: ps, movimientos })
  },

  mergeProductos: (entrantes) => {
    const estado = get()
    const existentes = estado.productos
    // Índice por refCatalysis para búsqueda O(1)
    const porRef = new Map(existentes.map((p) => [p.refCatalysis.trim(), p]))

    const productosFinales: Producto[] = [...existentes]
    const nuevosMovimientos: Movimiento[] = []
    const resultado: ResultadoImportacion = { nuevas: 0, actualizadas: 0, sinCambios: 0, ignoradas: 0 }

    for (const entrante of entrantes) {
      const ref = entrante.refCatalysis.trim()
      const existente = porRef.get(ref)

      if (!existente) {
        // Nueva referencia — la añadimos conservando categoría si la trae
        productosFinales.push(entrante)
        nuevosMovimientos.push({
          id: crypto.randomUUID(),
          fecha: new Date().toISOString(),
          tipo: 'importacion',
          refCatalysis: entrante.refCatalysis,
          descripcion: entrante.descripcion,
          proveedor: entrante.proveedor,
          unidadesAntes: 0,
          unidadesDespues: entrante.unidades,
          diferencia: entrante.unidades,
          notas: 'Nueva referencia — importación incremental',
        })
        resultado.nuevas++
      } else {
        // Referencia existente: compara campos relevantes
        const cambioUnidades = existente.unidades !== entrante.unidades
        const cambioDatos =
          existente.descripcion !== entrante.descripcion ||
          existente.proveedor !== entrante.proveedor ||
          existente.unidadMedida !== entrante.unidadMedida ||
          existente.fechaRecuento !== entrante.fechaRecuento ||
          existente.fechaUtilizacion !== entrante.fechaUtilizacion

        if (!cambioUnidades && !cambioDatos) {
          resultado.sinCambios++
          continue
        }

        // Fusionar: datos del Excel + conservar campos manuales (categoria, stockMinimo, notas, id)
        const fusionado: Producto = {
          ...entrante,
          id: existente.id,
          categoria: existente.categoria,         // conservar categoría manual
          stockMinimo: existente.stockMinimo,     // conservar mínimo manual
          notas: existente.notas,                 // conservar notas manuales
        }

        const idx = productosFinales.findIndex((p) => p.id === existente.id)
        if (idx !== -1) productosFinales[idx] = fusionado

        if (cambioUnidades) {
          nuevosMovimientos.push({
            id: crypto.randomUUID(),
            fecha: new Date().toISOString(),
            tipo: 'ajuste',
            refCatalysis: fusionado.refCatalysis,
            descripcion: fusionado.descripcion,
            proveedor: fusionado.proveedor,
            unidadesAntes: existente.unidades,
            unidadesDespues: fusionado.unidades,
            diferencia: fusionado.unidades - existente.unidades,
            notas: 'Actualización — importación incremental',
          })
        }
        resultado.actualizadas++
      }
    }

    set((s) => ({
      productos: productosFinales,
      movimientos: [...nuevosMovimientos, ...s.movimientos],
    }))
    return resultado
  },

  setFiltros: (f) =>
    set((s) => ({ filtros: { ...s.filtros, ...f } })),

  clearMovimientos: () => set({ movimientos: [] }),

  addPedido: (pedido) => {
    // Asigna número correlativo si no viene con uno
    const numero = pedido.numeroPedido || siguienteNumeroPedido(get().pedidos)
    set((s) => ({ pedidos: [{ ...pedido, numeroPedido: numero }, ...s.pedidos] }))
  },

  cancelarPedido: (id) =>
    set((s) => ({
      pedidos: s.pedidos.map((p) =>
        p.id === id ? { ...p, estado: 'cancelado' } : p
      ),
    })),

  recibirPedido: (pedidoId, lineasRecibidas) => {
    const state = get()
    const pedido = state.pedidos.find((p) => p.id === pedidoId)
    if (!pedido) return

    // Actualizar productos y generar movimientos por cada línea recibida
    let productosActualizados = [...state.productos]
    const nuevosMovimientos: Movimiento[] = []

    for (const linea of lineasRecibidas) {
      if (linea.unidadesRecibidas <= 0) continue
      const idx = productosActualizados.findIndex((p) => p.id === linea.productoId)
      if (idx === -1) continue

      const antes = productosActualizados[idx].unidades
      const despues = antes + linea.unidadesRecibidas
      productosActualizados[idx] = { ...productosActualizados[idx], unidades: despues }

      nuevosMovimientos.push({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        tipo: 'ajuste',
        refCatalysis: linea.refCatalysis,
        descripcion: linea.descripcion,
        proveedor: pedido.proveedor,
        unidadesAntes: antes,
        unidadesDespues: despues,
        diferencia: linea.unidadesRecibidas,
        notas: `Recepción pedido ${pedido.numeroPedido}`,
      })
    }

    // Determinar estado final del pedido
    const totalPedido = lineasRecibidas.reduce((s, l) => s + l.unidadesPedidas, 0)
    const totalRecibido = lineasRecibidas.reduce((s, l) => s + l.unidadesRecibidas, 0)
    const estadoFinal = totalRecibido >= totalPedido ? 'recibido' : 'parcial'

    set((s) => ({
      productos: productosActualizados,
      movimientos: [...nuevosMovimientos, ...s.movimientos],
      pedidos: s.pedidos.map((p) =>
        p.id === pedidoId
          ? { ...p, estado: estadoFinal, lineas: lineasRecibidas, fechaRecepcion: new Date().toISOString() }
          : p
      ),
    }))
  },

  // ── Tareas ──────────────────────────────────────────────────────────────────
  addTarea: (t) =>
    set((s) => ({ tareas: [t, ...s.tareas] })),

  updateTarea: (t) =>
    set((s) => ({ tareas: s.tareas.map((x) => (x.id === t.id ? t : x)) })),

  deleteTarea: (id) =>
    set((s) => ({ tareas: s.tareas.filter((x) => x.id !== id) })),

  cambiarEstadoTarea: (id, estado) =>
    set((s) => ({
      tareas: s.tareas.map((t) =>
        t.id === id
          ? { ...t, estado, fechaCompletada: estado === 'completada' ? new Date().toISOString() : undefined }
          : t
      ),
    })),
}), { name: 'anlleris-stock' }))

/**
 * Devuelve los productos filtrados con useMemo para evitar bucles infinitos
 * (un selector que devuelve array nuevo cada vez provoca re-render infinito en Zustand).
 */
export function useProductosFiltrados() {
  const productos = useInventoryStore((s) => s.productos)
  const filtros = useInventoryStore((s) => s.filtros)

  return useMemo(() => {
    const { busqueda, proveedor, estado, categoria } = filtros
    return productos.filter((p) => {
      if (
        busqueda &&
        !p.refCatalysis.toLowerCase().includes(busqueda.toLowerCase()) &&
        !p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
        return false
      if (proveedor && p.proveedor !== proveedor) return false
      if (categoria && (p.categoria ?? '') !== categoria) return false
      if (estado) {
        const st =
          p.unidades === 0 ? 'sin_stock' : p.unidades < 500 ? 'stock_bajo' : 'con_stock'
        if (st !== estado) return false
      }
      return true
    })
  }, [productos, filtros])
}

/** Número de pedidos con estado pendiente o parcial */
export function usePedidosActivos() {
  return useInventoryStore((s) =>
    s.pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'parcial').length
  )
}

/** Siguiente número de pedido disponible (para mostrar en el modal de creación) */
export function useNextNumeroPedido() {
  return useInventoryStore((s) => siguienteNumeroPedido(s.pedidos))
}

/** Número de tareas pendientes o en curso */
export function useTareasPendientes() {
  return useInventoryStore((s) =>
    s.tareas.filter((t) => t.estado !== 'completada').length
  )
}
