CREATE OR REPLACE FUNCTION public.get_user_post_interactions(
    p_user_id UUID,
    p_post_ids UUID[]
)
RETURNS TABLE (
    post_id UUID,
    user_liked BOOLEAN,
    user_prayed BOOLEAN,
    user_fired BOOLEAN
)
LANGUAGE sql
STABLE
AS $function$
    SELECT
        post_ids.id AS post_id,
        EXISTS(
            SELECT 1
            FROM public.post_likes AS likes
            WHERE likes.post_id = post_ids.id
              AND likes.user_id = p_user_id
        ) AS user_liked,
        EXISTS(
            SELECT 1
            FROM public.post_prayers AS prayers
            WHERE prayers.post_id = post_ids.id
              AND prayers.user_id = p_user_id
        ) AS user_prayed,
        EXISTS(
            SELECT 1
            FROM public.post_fires AS fires
            WHERE fires.post_id = post_ids.id
              AND fires.user_id = p_user_id
        ) AS user_fired
    FROM (
        SELECT DISTINCT unnest(COALESCE(p_post_ids, ARRAY[]::UUID[])) AS id
    ) AS post_ids;
$function$;
