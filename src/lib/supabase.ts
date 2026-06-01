// ============================================================
// SUPABASE — Código preparado pero COMPLETAMENTE COMENTADO.
// Para activar: descomentar, añadir credenciales en .env y
// descomentar las importaciones en los componentes que lo usen.
// ============================================================

// import { createClient } from '@supabase/supabase-js'
// import type { Producto } from '../types'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Schema SQL ---
// create table productos (
//   id uuid primary key default gen_random_uuid(),
//   ref_catalysis text not null,
//   ref_proveedor text,
//   descripcion text not null,
//   unidades integer default 0,
//   unidad_medida text default '1 UND',
//   proveedor text,
//   fecha_recuento date,
//   fecha_utilizacion date,
//   notas text,
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );

// --- Funciones CRUD ---

// export async function getProductos(): Promise<Producto[]> {
//   const { data, error } = await supabase
//     .from('productos')
//     .select('*')
//     .order('ref_catalysis')
//   if (error) throw error
//   return (data ?? []).map(mapRow)
// }

// export async function createProducto(p: Omit<Producto, 'id'>): Promise<Producto> {
//   const { data, error } = await supabase
//     .from('productos')
//     .insert(toRow(p))
//     .select()
//     .single()
//   if (error) throw error
//   return mapRow(data)
// }

// export async function updateProducto(p: Producto): Promise<void> {
//   const { error } = await supabase
//     .from('productos')
//     .update(toRow(p))
//     .eq('id', p.id)
//   if (error) throw error
// }

// export async function deleteProducto(id: string): Promise<void> {
//   const { error } = await supabase.from('productos').delete().eq('id', id)
//   if (error) throw error
// }

// --- Helpers de mapeo ---

// function mapRow(row: Record<string, unknown>): Producto {
//   return {
//     id: row.id as string,
//     refCatalysis: row.ref_catalysis as string,
//     refProveedor: row.ref_proveedor as string | undefined,
//     descripcion: row.descripcion as string,
//     unidades: row.unidades as number,
//     unidadMedida: row.unidad_medida as string,
//     proveedor: row.proveedor as string,
//     fechaRecuento: row.fecha_recuento as string | undefined,
//     fechaUtilizacion: row.fecha_utilizacion as string | undefined,
//     notas: row.notas as string | undefined,
//   }
// }

// function toRow(p: Omit<Producto, 'id'>): Record<string, unknown> {
//   return {
//     ref_catalysis: p.refCatalysis,
//     ref_proveedor: p.refProveedor,
//     descripcion: p.descripcion,
//     unidades: p.unidades,
//     unidad_medida: p.unidadMedida,
//     proveedor: p.proveedor,
//     fecha_recuento: p.fechaRecuento,
//     fecha_utilizacion: p.fechaUtilizacion,
//     notas: p.notas,
//   }
// }

export {}
