

# Plan: Perfil de Usuario, Preguntas en Publicaciones, Validaciones y API de Autos

## Overview

Cuatro bloques de funcionalidad: (1) gestion de perfil con edicion de nombre/telefono y cambio de email con verificacion, (2) sistema de preguntas y respuestas estilo Mercado Libre en cada publicacion, (3) validaciones robustas en filtros y formulario de publicacion (sin negativos, ano limitado, dropdowns con busqueda), (4) integracion con API-Ninjas para marcas y modelos de autos con seleccion en cascada.

---

## 1. Gestion de Perfil

### Database Migration
- Add columns to `app_users`: `nombre text`, `telefono text`, `avatar_url text`
- RLS: users can update their own profile (already exists)

### New Page: `src/pages/Profile.tsx`
- Formulario con campos: nombre, telefono, email (read-only, con boton "Cambiar email")
- Cambio de email usa `supabase.auth.updateUser({ email: newEmail })` que envia verificacion automatica
- Boton guardar para nombre/telefono via `supabase.from("app_users").update(...)`

### Navbar Update
- Agregar link a "/perfil" con icono de usuario cuando esta autenticado

### Route in App.tsx
- Add `/perfil` route

---

## 2. Sistema de Preguntas y Respuestas

### Database Migration
```sql
create table public.preguntas (
  id uuid primary key default gen_random_uuid(),
  publicacion_id bigint not null references publicaciones(id) on delete cascade,
  user_id uuid not null,
  pregunta text not null,
  respuesta text,
  respondido_por uuid,
  created_at timestamptz default now(),
  respondido_at timestamptz
);
-- RLS: anyone can SELECT, authenticated buyers can INSERT, 
-- only the publication owner can UPDATE (to add response)
```

### VehicleDetail.tsx Update
- Add "Preguntas" section below description
- Buyers see a text input to submit questions
- Seller of the listing sees "Responder" button on unanswered questions
- All users see answered Q&A pairs

### New Component: `src/components/QuestionsSection.tsx`
- Fetch questions for the publication
- Display Q&A list
- Input form for buyers (hidden if not logged in or if user is the seller)
- Response form for seller only

---

## 3. Validaciones y Dropdowns con Busqueda

### Combobox Component: `src/components/ui/combobox.tsx`
- Dropdown con input de texto para filtrar opciones (basado en Command/Popover existentes)
- Reutilizable para: ano, pais, provincia, marca, modelo

### CreateListing.tsx Changes
- Ano: Combobox con opciones de 1886 a ano actual, no permite valores fuera de rango
- Precio: min=1, no negativos
- Kilometraje: min=0, no negativos
- Marca: Combobox que carga marcas desde edge function (API-Ninjas)
- Modelo: Combobox que carga modelos al seleccionar marca
- Pais y Provincia: reemplazar Select por Combobox con filtrado de texto

### VehicleFilters.tsx Changes
- Precio min/max: min=0, no negativos
- Ano min: Combobox con rango 1886-actual
- Marca, Pais, Provincia: Combobox con filtrado

---

## 4. Integracion API-Ninjas (Marcas y Modelos)

### API Key Secret
- Solicitar al usuario su API key de API-Ninjas y guardarla como secret `API_NINJAS_KEY`

### Edge Function: `supabase/functions/car-api/index.ts`
- Proxy seguro que llama a `api.api-ninjas.com/v1/carmakes` y `/v1/carmodels?make=X`
- Acepta query params `endpoint` ("makes" o "models") y `make` (para modelos)
- Devuelve array de strings

### Hook: `src/hooks/useCarApi.ts`
- `useCarMakes()`: fetch makes via edge function, cache con react-query
- `useCarModels(make)`: fetch models para una marca seleccionada

---

## Files to Create
1. `src/pages/Profile.tsx` - Pagina de perfil
2. `src/components/QuestionsSection.tsx` - Preguntas y respuestas
3. `src/components/ui/combobox.tsx` - Dropdown con busqueda
4. `supabase/functions/car-api/index.ts` - Proxy para API-Ninjas
5. `src/hooks/useCarApi.ts` - Hook para marcas/modelos

## Files to Modify
1. `src/App.tsx` - Nueva ruta /perfil
2. `src/components/Navbar.tsx` - Link a perfil
3. `src/pages/VehicleDetail.tsx` - Seccion de preguntas
4. `src/pages/CreateListing.tsx` - Comboboxes y validaciones
5. `src/components/VehicleFilters.tsx` - Comboboxes y validaciones

## Database Migrations
1. Add profile columns to `app_users`
2. Create `preguntas` table with RLS

## Implementation Order
1. Secret de API-Ninjas + Edge function car-api
2. Combobox component
3. Migracion DB (profile columns + preguntas table)
4. Profile page + route + navbar
5. CreateListing con comboboxes y validaciones
6. VehicleFilters con comboboxes y validaciones
7. QuestionsSection + integracion en VehicleDetail

