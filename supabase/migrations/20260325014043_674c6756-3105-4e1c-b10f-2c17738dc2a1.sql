
-- New table: favoritos
CREATE TABLE public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publicacion_id bigint NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, publicacion_id)
);
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favoritos" ON public.favoritos FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own favoritos" ON public.favoritos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own favoritos" ON public.favoritos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- New columns on publicaciones
ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS precio_estimado_min numeric,
  ADD COLUMN IF NOT EXISTS precio_estimado_max numeric,
  ADD COLUMN IF NOT EXISTS puntaje integer;
