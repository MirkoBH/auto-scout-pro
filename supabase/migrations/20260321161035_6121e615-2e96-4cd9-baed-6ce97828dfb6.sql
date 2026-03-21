
-- Add columns to publicaciones
ALTER TABLE public.publicaciones 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS estado_vehiculo text,
  ADD COLUMN IF NOT EXISTS estimacion_danos text;

-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehiculos', 'vehiculos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can read
CREATE POLICY "Public read access on vehiculos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehiculos');

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload to vehiculos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehiculos');

-- Storage RLS: users can delete their own uploads
CREATE POLICY "Users can delete own uploads in vehiculos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehiculos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS for app_users
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.app_users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.app_users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS for publicaciones
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view publicaciones" ON public.publicaciones
  FOR SELECT USING (true);

CREATE POLICY "Sellers can insert publicaciones" ON public.publicaciones
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can update own publicaciones" ON public.publicaciones
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can delete own publicaciones" ON public.publicaciones
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS for imagenes_publicacion
ALTER TABLE public.imagenes_publicacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view imagenes" ON public.imagenes_publicacion
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert imagenes" ON public.imagenes_publicacion
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update imagenes" ON public.imagenes_publicacion
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
