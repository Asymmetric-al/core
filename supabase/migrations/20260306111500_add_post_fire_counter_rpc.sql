-- Add atomic RPC helpers for post fire counters.
-- These mirror the existing like/prayer counter helpers.

CREATE OR REPLACE FUNCTION public.increment_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = COALESCE(fires_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = GREATEST(COALESCE(fires_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;
