/** Fixed demo profile id (seeded in supabase/seed.sql). Used for viewer context. */
export const DEMO_PROFILE_ID = "11111111-1111-1111-1111-111111111111" as const;

/** Same id as `DEMO_PROFILE_ID`: demo seed ties one auth user to that profile row. */
export const DEMO_USER_ID = DEMO_PROFILE_ID;
