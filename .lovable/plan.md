

# Plan: Rediseno Visual Apple HIG

## Overview

Aplicar la identidad visual Apple HIG completa: nueva paleta (#D32F45 primario, #F5F5F5 fondo, #000/#666 texto), glassmorphism en header, bordes redondeados 16px, skeleton loaders, filtros drawer en movil, hover scale en cards, y animaciones de entrada stagger.

## Files to Modify

### 1. `src/index.css` - Nueva paleta de colores
- Primario: `#D32F45` (rojo) en lugar del azul actual
- Background: `#F5F5F5`, Cards: `#FFFFFF`
- Texto: `#000000` titulos, `#666666` cuerpo
- Border radius: `1rem` (16px)
- Mantener dark mode con equivalentes oscuros

### 2. `tailwind.config.ts` - Radius y animaciones
- Cambiar `--radius` a `1rem`
- Agregar animaciones: `stagger-fade-in`, `scale-press` (0.98), `slide-up` para drawer
- Agregar clase `.glass` para backdrop-blur

### 3. `src/components/Navbar.tsx` - Glassmorphism header
- Fondo con `bg-white/70 backdrop-blur-xl` en lugar de `bg-card/80`
- Bordes mas sutiles, efecto blur mas pronunciado

### 4. `src/components/VehicleCard.tsx` - Tarjetas Apple-style
- Aspect ratio 4:3 en imagen
- Hover `scale-[1.02]` con transicion suave
- Sombras muy suaves, bordes 16px
- Badge "Analizado por IA" con estilo refinado
- Skeleton loader como placeholder

### 5. `src/components/VehicleFilters.tsx` - Drawer en movil
- Desktop: mantener layout horizontal
- Movil: usar `Drawer` component (vaul) que sube desde abajo
- Boton trigger con icono de filtros
- Usar `useIsMobile()` hook existente

### 6. `src/pages/Index.tsx` - Hero y grid mejorados
- Hero con gradiente sutil, tipografia mas grande
- Grid con animacion stagger en cards (delay incremental)
- Skeleton screens durante carga en vez de spinner

### 7. `src/pages/VehicleDetail.tsx` - Detalles refinados
- Carousel con bordes 16px y transiciones suaves
- Seccion "Analisis Inteligente" con acento #D32F45 para alertas
- Specs cards con glassmorphism sutil

### 8. `src/pages/Auth.tsx` - Login Apple-style
- Card con glassmorphism
- Botones de rol con transicion `scale-[0.98]` al presionar
- Bordes mas redondeados

### 9. `src/pages/CreateListing.tsx` - Formulario refinado
- Card con sombra suave y radius 16px
- Inputs con bordes finos `#666`, foco con ring sutil rojo
- Selector de imagenes con borde rojo al seleccionar

### 10. `src/pages/Dashboard.tsx` - Estadisticas con glass
- Cards de stats con glassmorphism
- Lista de publicaciones mas limpia

### 11. `src/components/ImageUpload.tsx` - Miniaturas mejoradas
- Borde rojo (#D32F45) en imagen seleccionada/activa
- Thumbnails con radius 12px

## Technical Details

- No se agregan dependencias nuevas (Drawer ya existe via vaul)
- `useIsMobile()` hook ya existe para responsive filters
- Skeleton component ya disponible en `ui/skeleton.tsx`
- Animaciones via Tailwind keyframes, sin Framer Motion (mantener bundle ligero)
- Colores se definen en CSS variables para consistencia light/dark

## Implementation Order

1. CSS variables y tailwind config (paleta + radius + animaciones)
2. Navbar glassmorphism
3. VehicleCard rediseno
4. VehicleFilters drawer movil
5. Index page (hero, skeletons, stagger)
6. Paginas restantes (Auth, Detail, CreateListing, Dashboard)

