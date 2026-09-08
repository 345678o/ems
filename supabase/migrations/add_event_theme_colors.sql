-- Store an auto-extracted 3-color palette (primary/dark/light) derived from
-- each event's 1x1 banner image. Null means "no palette yet, use default theme".
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS theme_colors JSONB;
