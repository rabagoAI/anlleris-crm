# CLAUDE.md — anlleris-crm

## Descripción del proyecto
CRM de gestión de inventario de stock para la empresa ANLLERIS.
Usuario final: personal de almacén sin conocimientos técnicos.
Developer/soporte: Paco García (RABAGO AI).

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (sin shadcn, clases utilitarias directas)
- Zustand (estado global del inventario)
- SheetJS / xlsx (importar y exportar Excel)
- jsPDF + jspdf-autotable (exportar PDF)
- Recharts (gráficos en la sección Informes)
- Lucide React (iconos)
- Vercel (despliegue)

## Arquitectura de datos
El modo principal es Import/Export Excel: los datos viven en memoria (Zustand).
El código de Supabase debe estar preparado pero COMPLETAMENTE COMENTADO,
listo para activarse en el futuro descomentando y añadiendo credenciales.

## Estructura de carpetas
```
src/
  components/
    layout/
      Sidebar.tsx
      TopBar.tsx
    inventory/
      InventoryTable.tsx
      ProductModal.tsx        # modal reutilizable para Nuevo y Editar
      DeleteConfirmModal.tsx
      StatsRow.tsx
      FilterBar.tsx
    import-export/
      ImportExcel.tsx         # drag & drop + botón
      ExportButtons.tsx       # botones Excel y PDF
    charts/
      StockByStatusChart.tsx
      StockByProveedorChart.tsx
      ObsoleteAlert.tsx
  lib/
    excelParser.ts            # lee Excel del usuario con SheetJS
    excelExporter.ts          # genera Excel desde datos actuales
    pdfExporter.ts            # genera PDF con jsPDF + autotable
    supabase.ts               # COMENTADO — schema + funciones listas
  store/
    inventoryStore.ts         # Zustand store
  types/
    index.ts                  # interfaces TypeScript
  pages/
    InventarioPage.tsx
    InformesPage.tsx
    ProveedoresPage.tsx
  App.tsx
  main.tsx
```

## Tipos principales (types/index.ts)
```typescript
export interface Producto {
  id: string                  // uuid generado en cliente
  refCatalysis: string        // obligatorio
  refProveedor?: string
  descripcion: string         // obligatorio
  unidades: number
  unidadMedida: string
  proveedor: string
  fechaRecuento?: string      // formato DD/MM/YYYY
  fechaUtilizacion?: string
  notas?: string
}

export type StockStatus = 'sin_stock' | 'stock_bajo' | 'con_stock'

export interface FiltrosInventario {
  busqueda: string
  proveedor: string
  estado: StockStatus | ''
}
```

## Lógica de negocio
- Sin stock: unidades === 0
- Stock bajo: unidades > 0 && unidades < 500
- Con stock: unidades >= 500
- Referencia obsoleta: fechaRecuento anterior a hace 2 años

## Componentes clave

### ProductModal
Modal reutilizable para CREAR y EDITAR. Recibe:
- `mode: 'create' | 'edit'`
- `producto?: Producto` (si mode === 'edit')
- `onSave: (p: Producto) => void`
- `onClose: () => void`
Campos: refCatalysis*, refProveedor, descripcion*, unidades*, unidadMedida,
proveedor (select), fechaRecuento, fechaUtilizacion, notas.

### ImportExcel
- Zona drag & drop visible y grande (usuarios no técnicos)
- Mensaje claro: "Arrastra tu Excel aquí o haz clic para seleccionar"
- Mapea columnas del Excel al tipo Producto automáticamente
- Columnas esperadas: Ref. Catalysis, Ref. Proveedor, Descripción,
  Unidades, Unidad de Medida, Nombre Proveedor, Fecha recuento, Fecha utilización
- Si el Excel no tiene cabeceras exactas, intenta mapear por posición (fila 3 del Excel original)
- Muestra toast de éxito con el número de referencias importadas

### ExportButtons
- Exportar Excel: genera .xlsx con SheetJS con el mismo formato que el original
- Exportar PDF: modal con opciones (título, qué incluir, orientación)
  luego genera con jsPDF + autotable

### InformesPage
Gráficos con Recharts:
1. Donut chart: distribución Sin stock / Stock bajo / Con stock
2. Bar chart horizontal: top 10 proveedores por unidades totales
3. Tabla de alertas: referencias con fechaRecuento anterior a 2 años
4. KPIs: total referencias, total unidades, % con stock, proveedor principal

## Supabase (comentado)
El archivo supabase.ts debe incluir el schema SQL comentado:
```sql
-- create table productos (
--   id uuid primary key default gen_random_uuid(),
--   ref_catalysis text not null,
--   ref_proveedor text,
--   descripcion text not null,
--   unidades integer default 0,
--   unidad_medida text default '1 UND',
--   proveedor text,
--   fecha_recuento date,
--   fecha_utilizacion date,
--   notas text,
--   created_at timestamptz default now(),
--   updated_at timestamptz default now()
-- );
```
Y las funciones CRUD comentadas listas para descomentar.

## Estilo visual
- Paleta: azul corporativo #185FA5 como color primario
- Fondo general: #F8F9FA (gris muy claro)
- Sidebar: blanco con borde derecho sutil
- Tipografía: Inter (Google Fonts) o system-ui como fallback
- Bordes: 1px solid #E5E7EB
- Border radius: 8px componentes, 12px cards
- Sin sombras exageradas — diseño limpio y funcional

## Despliegue Vercel
- El proyecto es 100% estático (Vite build → dist/)
- vercel.json no necesario para SPA básica
- Variables de entorno para Supabase (cuando se active):
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=

## Convenciones de código
- Componentes: PascalCase, un componente por archivo
- Funciones y variables: camelCase
- Español para textos de UI, inglés para código
- No usar `any` en TypeScript
- Comentarios en español donde ayude al mantenimiento
- Cada componente exporta default

## Notas importantes
- Los usuarios NO son técnicos: mensajes de error claros en español,
  sin jerga técnica en la UI
- El flujo principal es: importar Excel → trabajar → exportar Excel
- Toasts para feedback de acciones (guardado, importado, eliminado, exportado)
- Confirmación siempre antes de eliminar (modal, no window.confirm)
- La app debe funcionar bien en pantallas de 1366px (portátiles de oficina)
