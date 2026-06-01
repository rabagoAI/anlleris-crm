export interface Producto {
  id: string
  refCatalysis: string
  refProveedor?: string
  descripcion: string
  unidades: number
  unidadMedida: string
  proveedor: string
  fechaRecuento?: string   // DD/MM/YYYY
  fechaUtilizacion?: string
  notas?: string
  stockMinimo?: number     // umbral de alerta de reposición
  categoria?: string       // familia de producto (estuches, frascos, cajas…)
}

/** Resultado de una importación incremental */
export interface ResultadoImportacion {
  nuevas: number       // referencias que no existían
  actualizadas: number // referencias que existían y han cambiado
  sinCambios: number   // referencias que existían y son idénticas
  ignoradas: number    // filas vacías o inválidas descartadas
}

/** Comprueba si un producto necesita reposición según su stockMinimo */
export function necesitaReposicion(p: Producto): boolean {
  return p.stockMinimo !== undefined && p.stockMinimo > 0 && p.unidades <= p.stockMinimo
}

export type StockStatus = 'sin_stock' | 'stock_bajo' | 'con_stock'

export type TipoMovimiento =
  | 'importacion'   // carga masiva de Excel
  | 'creacion'      // nueva referencia manual
  | 'ajuste'        // edición de unidades
  | 'edicion'       // edición de otros campos (sin cambio de unidades)
  | 'eliminacion'   // referencia borrada

export interface Movimiento {
  id: string
  fecha: string           // ISO timestamp
  tipo: TipoMovimiento
  refCatalysis: string
  descripcion: string
  proveedor: string
  unidadesAntes: number
  unidadesDespues: number
  diferencia: number      // positivo = entrada, negativo = salida
  notas?: string          // descripción libre del cambio
}

// ─── Pedidos a proveedor ────────────────────────────────────────────────────

export type EstadoPedido = 'pendiente' | 'recibido' | 'parcial' | 'cancelado'

export interface LineaPedido {
  id: string
  productoId: string
  refCatalysis: string
  descripcion: string
  unidadMedida: string
  unidadesPedidas: number
  unidadesRecibidas: number  // se rellena al recepcionar
}

export interface Pedido {
  id: string
  numeroPedido: string       // P-001, P-002…
  proveedor: string
  fechaCreacion: string      // ISO timestamp
  fechaEsperada?: string     // DD/MM/YYYY — fecha estimada de llegada
  fechaRecepcion?: string    // ISO timestamp — cuando se recepcionó
  estado: EstadoPedido
  lineas: LineaPedido[]
  notas?: string
}

// ─── Tareas ──────────────────────────────────────────────────────────────────

export type PrioridadTarea = 'alta' | 'media' | 'baja'
export type EstadoTarea    = 'pendiente' | 'en_curso' | 'completada'

export interface Tarea {
  id: string
  titulo: string
  descripcion?: string
  /** Referencia Catalysis a la que se asocia (opcional) */
  refCatalysis?: string
  /** Proveedor al que se asocia (opcional, se rellena sola si hay ref) */
  proveedor?: string
  prioridad: PrioridadTarea
  estado: EstadoTarea
  fechaCreacion: string    // ISO timestamp
  fechaVencimiento?: string // DD/MM/YYYY
  fechaCompletada?: string  // ISO timestamp
}

// ─── Inventario filtros ──────────────────────────────────────────────────────

export interface FiltrosInventario {
  busqueda: string
  proveedor: string
  estado: StockStatus | ''
  categoria: string
}

/** Calcula el estado de stock de un producto */
export function getStockStatus(unidades: number): StockStatus {
  if (unidades === 0) return 'sin_stock'
  if (unidades < 500) return 'stock_bajo'
  return 'con_stock'
}

/** Comprueba si una referencia está obsoleta (fechaRecuento > 2 años) */
export function isObsolete(fechaRecuento?: string): boolean {
  if (!fechaRecuento) return false
  const [d, m, y] = fechaRecuento.split('/')
  if (!d || !m || !y) return false
  const fecha = new Date(Number(y), Number(m) - 1, Number(d))
  const hace2anos = new Date()
  hace2anos.setFullYear(hace2anos.getFullYear() - 2)
  return fecha < hace2anos
}
