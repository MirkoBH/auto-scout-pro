-- Add profile columns to app_users
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS nombre text,
  ADD COLUMN IF NOT EXISTS telefono text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create preguntas table
CREATE TABLE public.preguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id bigint NOT NULL REFERENCES public.publicaciones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  pregunta text NOT NULL,
  respuesta text,
  respondido_por uuid,
  created_at timestamptz DEFAULT now(),
  respondido_at timestamptz
);

ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions
CREATE POLICY "Anyone can view preguntas"
  ON public.preguntas FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert questions
CREATE POLICY "Authenticated can insert preguntas"
  ON public.preguntas FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Publication owner can update (to add response)
CREATE POLICY "Publication owner can respond"
  ON public.preguntas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = preguntas.publicacion_id
      AND publicaciones.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = preguntas.publicacion_id
      AND publicaciones.user_id = auth.uid()
    )
  );

-- Users can delete their own questions
CREATE POLICY "Users can delete own preguntas"
  ON public.preguntas FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());