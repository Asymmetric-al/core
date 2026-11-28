-- WP7 pull request 1b, "Review leftovers" (AL-2680; issue 2850, item 6 of
-- the list of 28 November). A post whose assignment key changes reads its
-- new worker's restriction under a share lock on that worker's Party, so a
-- move of the key and a restriction of the worker it moves to serialize, and
-- the moved post ends withheld whichever of the two commits first.
--
-- private.posts_review_on_write(), the BEFORE ROW trigger function of
-- public.posts (zzz_wp7_posts_review_on_write): its text from 20261127070000
-- with one change. On an UPDATE whose (tenant_id, ministry_assignment_id)
-- differs from the old row's and names a worker, it reads that worker's
-- Party FOR SHARE, as an INSERT already does, and sets worker_withheld from
-- it. Every other UPDATE (a reaction, an edit, a review decision, a
-- restriction's own write) reads the Party with no lock, as before, so no
-- such write waits on a Party. Owner, grants, trigger and answers are
-- unchanged.
--
-- Why: an invited worker's acceptance (pull request 2869) sets the worker's
-- login, and the re-derivation of that login's children moves the keys of
-- its posts. Without the lock a restriction committing while a move is in
-- flight leaves the moved post served: the move read the Party before the
-- restriction committed, and the restriction's update of the worker's posts
-- did not see the moved row.
--
-- The lock: FOR SHARE on the destination Party's row, taken inside the
-- post's UPDATE after the post's row lock and after WP5's advisory lock
-- ('ministry_assignment_key', organization:login), held to COMMIT. A
-- restriction or a lift holds that Party FOR UPDATE and then writes the
-- worker's posts. A move that comes first makes the restriction wait, and
-- the restriction's own update of the worker's posts, under a snapshot taken
-- after the move committed, withholds the moved post. A restriction that
-- comes first makes the move wait, and the move then reads the restricted
-- Party.
--
-- Lock order of each statement that reaches this trigger with a changed key:
-- - acceptance of an invitation naming a Party (tenant_guard.accept_
--   membership_invitation, private.accept_worker_invitation, 2869): the
--   organization's row FOR NO KEY UPDATE, the writer's lock, the caller's
--   membership rows, the invitation row, the Party FOR UPDATE, its worker
--   row, the login's key, the posts' rows, then this share lock on the same
--   Party, which it already holds: it never waits here;
-- - private.repair_ministry_assignment_ids() (owner only): the rows of
--   posts it corrects, FOR UPDATE, then for each row its key and this lock;
-- - an owner's write of a worker row (public.missionaries): that row, the
--   keys of its old and new login, the rows of the posts it re-derives, then
--   for each moved row this lock;
-- - an owner's UPDATE of a post's missionary_id or tenant_id: the row, its
--   key, this lock.
-- Against them, a restriction, a lift, set_worker_identity and the confirm
-- of a level (tenant_guard): the organization's row FOR SHARE, the caller's
-- membership row FOR SHARE, the Party FOR UPDATE, then the worker's posts;
-- an owner's UPDATE of public.parties: the Party, then the posts. An
-- acceptance and these commands meet first on the organization's row, so
-- they never wait on each other in a cycle. A repair or an owner's worker
-- write that, in one statement, moves one post off a Party's worker and
-- another onto it can meet a restriction of that Party in a cycle: it holds
-- the first row and waits for the Party, the restriction holds the Party and
-- waits for that row. PostgreSQL then aborts one of the two with 40P01 (the
-- one whose deadlock check runs first once the cycle closes); nothing is
-- written wrongly. The worker routes answer 40P01 as "Mission Control is
-- busy. Try again." (503, RETRY); an owner runs the statement again. The six
-- reaction functions (public.atomic_like_post and the five others) change
-- counts, never the key, so they take no Party lock and never wait here.
--
-- Locks at migration time: the object lock on the replaced function only; no
-- table lock. lock_timeout stops a run rather than queue it.
--
-- What the running build does: nothing changes for it. No request of the
-- running build moves a post's key.
--
-- Recovery. The one statement is CREATE OR REPLACE and runs again unchanged;
-- a second run commits the same text. This file has committed when this
-- read-only check returns true (false before it, never an error):
-- Check begins
--   SELECT pg_catalog.strpos(pg_catalog.pg_get_functiondef('private.posts_review_on_write()'::pg_catalog.regprocedure), 'OLD.ministry_assignment_id') > 0 AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127110000.
--
-- Down (one transaction; after the build that ships 2869 is rolled back):
-- the function's text from 20261127070000.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   CREATE OR REPLACE FUNCTION private.posts_review_on_write()
--   \lines 294-354 of 20261127070000_wp7_1_review.sql
--   COMMIT;
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION private.posts_review_on_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_withheld BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_withheld := false;
    IF NEW.ministry_assignment_id IS NOT NULL THEN
      SELECT party.security_level IN ('restricted', 'high_risk') OR party.do_not_publish
        INTO v_withheld
        FROM public.missionaries AS worker
        JOIN public.parties AS party
          ON party.tenant_id = worker.tenant_id
         AND party.id = worker.party_id
       WHERE worker.tenant_id = NEW.tenant_id
         AND worker.id = NEW.ministry_assignment_id
         FOR SHARE OF party;
    END IF;
    NEW.worker_withheld := COALESCE(v_withheld, false);
    IF NEW.author_user_id IS NULL THEN
      SELECT profile.user_id
        INTO NEW.author_user_id
        FROM public.profiles AS profile
       WHERE profile.id = NEW.missionary_id;
    END IF;
    NEW.content_version := 1;
  ELSE
    NEW.author_user_id := OLD.author_user_id;
    NEW.content_version := OLD.content_version;
    IF NEW.ministry_assignment_id IS NOT NULL
       AND (NEW.tenant_id, NEW.ministry_assignment_id)
           IS DISTINCT FROM (OLD.tenant_id, OLD.ministry_assignment_id) THEN
      v_withheld := false;
      SELECT party.security_level IN ('restricted', 'high_risk') OR party.do_not_publish
        INTO v_withheld
        FROM public.missionaries AS worker
        JOIN public.parties AS party
          ON party.tenant_id = worker.tenant_id
         AND party.id = worker.party_id
       WHERE worker.tenant_id = NEW.tenant_id
         AND worker.id = NEW.ministry_assignment_id
         FOR SHARE OF party;
      NEW.worker_withheld := COALESCE(v_withheld, false);
    ELSE
      NEW.worker_withheld := private.ministry_assignment_withheld(NEW.tenant_id, NEW.ministry_assignment_id);
    END IF;
    IF NEW.title IS NOT DISTINCT FROM OLD.title
       AND NEW.content IS NOT DISTINCT FROM OLD.content
       AND NEW.media IS NOT DISTINCT FROM OLD.media
       AND NEW.image_url IS NOT DISTINCT FROM OLD.image_url
       AND NEW.visibility IS NOT DISTINCT FROM OLD.visibility
       AND NEW.post_type IS NOT DISTINCT FROM OLD.post_type
       AND NEW.type IS NOT DISTINCT FROM OLD.type
       AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    NEW.content_version := OLD.content_version + 1;
  END IF;
  IF NEW.ministry_assignment_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.review_state = 'approved')
     AND private.ministry_update_mode(NEW.tenant_id, NEW.ministry_assignment_id) = 'automatic' THEN
    NEW.review_state := 'approved';
    NEW.reviewed_at := pg_catalog.now();
    NEW.review_reason := 'automatic';
  ELSE
    NEW.review_state := 'submitted';
    NEW.reviewed_at := NULL;
    NEW.review_reason := NULL;
  END IF;
  NEW.reviewed_by := NULL;
  NEW.reviewed_by_assignment_id := NULL;
  RETURN NEW;
END;
$$;

COMMIT;
