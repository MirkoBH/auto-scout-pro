

# Plan: Plataforma Inteligente de Compra y Venta de Autos Usados

## Overview

Build a full car marketplace with authentication (Buyer/Seller roles), vehicle listings with image uploads, and simulated AI vehicle assessment. The app uses the existing Supabase tables (`app_users`, `publicaciones`, `imagenes_publicacion`).

## Database Changes

### 1. Add `user_id` column to `publicaciones`
- Add `user_id uuid REFERENCES auth.users(id)` to link listings to sellers
- Add `estado_vehiculo` and `estimacion_danos` text columns for AI assessment results

### 2. Create storage bucket `vehiculos`
- Public bucket for vehicle images
- RLS: authenticated users can upload; public read access

### 3. Add RLS policies
- `app_users`: users can read/update their own row
- `publicaciones`: anyone can SELECT; only owner can INSERT/UPDATE/DELETE
- `imagenes_publicacion`: same as publicaciones

## Pages & Components

### Authentication (`/auth`)
- Login/Register form with email+password
- On signup, user selects role (Comprador/Vendedor) which updates `app_users.type`
- AuthProvider context wrapping the app
- Protected routes for seller features

### Home Page (`/`)
- Hero section with search bar
- Grid of vehicle cards showing image, brand, model, year, price, location
- Filters: brand, price range, year, fuel type, transmission

### Vehicle Detail (`/vehiculo/:id`)
- Image carousel
- Full vehicle details
- AI assessment badge (estado + damage estimation)
- Contact seller button

### Seller Dashboard (`/dashboard`)
- List of seller's own publications
- Stats summary
- Link to create new listing

### Create/Edit Listing (`/publicar`)
- Form: marca, modelo, anio, kilometraje, tipo_combustible, transmision, precio, ubicacion, descripcion
- Multi-image upload to Supabase Storage bucket `vehiculos`
- On submit, calls edge function `assess-vehicle` for simulated AI assessment

## Edge Function: `assess-vehicle`

Uses Lovable AI Gateway to simulate vehicle condition assessment:
- Receives vehicle data (brand, model, year, mileage, description)
- Returns structured JSON: `{ estado: "Excelente|Bueno|Regular|Malo", estimacion_danos: string, puntaje: number }`
- Stores result in `publicaciones.estado_vehiculo` and `estimacion_danos`

## Key Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth state, login, signup, logout |
| `src/pages/Auth.tsx` | Login/Register page |
| `src/pages/Index.tsx` | Home with listings grid + filters |
| `src/pages/VehicleDetail.tsx` | Single vehicle view |
| `src/pages/Dashboard.tsx` | Seller dashboard |
| `src/pages/CreateListing.tsx` | Publish vehicle form |
| `src/components/VehicleCard.tsx` | Card component for grid |
| `src/components/ImageUpload.tsx` | Multi-image upload component |
| `src/components/Navbar.tsx` | Navigation bar |
| `src/components/VehicleFilters.tsx` | Filter sidebar/bar |
| `supabase/functions/assess-vehicle/index.ts` | AI assessment edge function |
| Migration SQL | Add columns, bucket, RLS policies |

## Implementation Order

1. Database migration (add columns, bucket, RLS)
2. Auth context + Auth page
3. Navbar with auth state
4. Home page with vehicle grid + filters
5. Create Listing page with image upload
6. Edge function for AI assessment
7. Vehicle Detail page
8. Seller Dashboard

