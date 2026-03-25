

## Plan: Editar publicaciones, Comparar vehículos y Lista de deseados

### Resumen

Se implementan tres funcionalidades principales:
1. **Editar publicaciones** -- Los vendedores pueden modificar sus publicaciones y la IA re-evalúa el vehículo (ahora con análisis de imágenes, rango de precio estimado y valoración detallada)
2. **Comparar vehículos** -- Los compradores pueden seleccionar 2 publicaciones y ver una comparación lado a lado
3. **Lista de deseados** -- Los compradores pueden guardar publicaciones que les interesen

---

### 1. Base de datos

**Nueva tabla `favoritos`:**
```sql
CREATE TABLE public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publicacion_id bigint NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, publicacion_id)
);
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
-- Select own
CREATE POLICY "Users can view own favoritos" ON public.favoritos FOR SELECT TO authenticated USING (user_id = auth.uid());
-- Insert own
CREATE POLICY "Users can insert own favoritos" ON public.favoritos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Delete own
CREATE POLICY "Users can delete own favoritos" ON public.favoritos FOR DELETE TO authenticated USING (user_id = auth.uid());
```

**Nuevas columnas en `publicaciones`:**
```sql
ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS precio_estimado_min numeric,
  ADD COLUMN IF NOT EXISTS precio_estimado_max numeric,
  ADD COLUMN IF NOT EXISTS puntaje integer;
```

---

### 2. Edge Function `assess-vehicle` mejorada

- Recibir `imagen_urls` (array de URLs de las fotos del vehículo) ademas de los datos actuales.
- Usar un modelo multimodal (`google/gemini-2.5-flash`) para enviar las imágenes como URLs en el prompt.
- El prompt indicará al modelo que analice las fotos buscando daños visibles, partes afectadas, y que considere marca/modelo/año/km para dar:
  - `estado`: Excelente/Bueno/Regular/Malo
  - `estimacion_danos`: descripción de daños visibles con partes afectadas
  - `puntaje`: 1-100
  - `precio_estimado_min`: precio mínimo estimado en USD
  - `precio_estimado_max`: precio máximo estimado en USD
- Tool calling schema actualizado con los nuevos campos.

---

### 3. Página de edición `EditListing.tsx`

- Nueva ruta `/editar/:id` en `App.tsx`.
- Carga los datos existentes de la publicación y sus imágenes.
- Reutiliza la misma estructura de formulario que `CreateListing.tsx` (marcas, modelos, comboboxes, imágenes).
- Al guardar: actualiza `publicaciones`, actualiza `imagenes_publicacion`, y re-invoca `assess-vehicle` con los datos e imágenes actualizadas.
- Persiste los nuevos campos (`precio_estimado_min`, `precio_estimado_max`, `puntaje`) en la tabla.
- Accesible desde el Dashboard (botón editar en cada publicación).

---

### 4. Comparar vehículos

- **Estado global de comparación**: Context o estado en `Index.tsx` que guarda hasta 2 IDs seleccionados.
- **Checkbox en `VehicleCard`**: Cuando el usuario es comprador, muestra un checkbox/botón para añadir a comparación.
- **Barra flotante**: Cuando hay 1-2 seleccionados, aparece un banner fijo abajo con "Comparar (2)" que enlaza a la página de comparación.
- **Nueva página `Compare.tsx`** (`/comparar?ids=1,2`):
  - Carga las 2 publicaciones con sus imágenes.
  - Tabla lado a lado mostrando: imagen principal, marca/modelo, año, precio, km, combustible, transmisión, ubicación, estado IA, puntaje, rango de precio estimado, descripción de daños.
  - Resalta diferencias con colores (mejor/peor valor).

---

### 5. Lista de deseados

- **Botón corazón** en `VehicleCard` y `VehicleDetail`: toggle para agregar/quitar de favoritos (insert/delete en tabla `favoritos`).
- **Hook `useFavorites`**: carga los favoritos del usuario, expone `toggleFavorite(pubId)` e `isFavorite(pubId)`.
- **Página `Favorites.tsx`** (`/favoritos`): lista las publicaciones guardadas con sus cards.
- **Link en Navbar** para compradores: icono corazón con contador.

---

### 6. Visualización de datos IA mejorados

- En `VehicleDetail.tsx`: mostrar rango de precio estimado y puntaje junto al badge de estado.
- En `Dashboard.tsx`: mostrar puntaje en la lista de publicaciones del vendedor.

---

### Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| Migración SQL | Crear tabla `favoritos` + columnas en `publicaciones` |
| `supabase/functions/assess-vehicle/index.ts` | Agregar análisis de imágenes, modelo multimodal, nuevos campos |
| `src/pages/EditListing.tsx` | Crear -- formulario de edición con re-evaluación IA |
| `src/pages/Compare.tsx` | Crear -- comparación lado a lado |
| `src/pages/Favorites.tsx` | Crear -- lista de deseados |
| `src/hooks/useFavorites.ts` | Crear -- lógica de favoritos |
| `src/App.tsx` | Agregar rutas `/editar/:id`, `/comparar`, `/favoritos` |
| `src/components/Navbar.tsx` | Link a favoritos para compradores |
| `src/components/VehicleCard.tsx` | Botón favorito + checkbox comparar |
| `src/pages/VehicleDetail.tsx` | Botón favorito + mostrar precio estimado/puntaje |
| `src/pages/Dashboard.tsx` | Botón editar en cada publicación |
| `src/pages/Index.tsx` | Estado de comparación + barra flotante |
| `src/pages/CreateListing.tsx` | Persistir nuevos campos IA al crear |

