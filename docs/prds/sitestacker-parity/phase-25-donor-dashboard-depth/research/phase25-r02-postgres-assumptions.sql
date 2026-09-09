-- Synthetic assumptions experiment only. Not Core schema, migration, or release proof.

CREATE TABLE review_posts(id int PRIMARY KEY, tenant text NOT NULL, source text NOT NULL, published int NOT NULL, visible boolean NOT NULL);
INSERT INTO review_posts VALUES (1,'a','x',1,true),(2,'a','y',2,true),(3,'a','x',3,true),(4,'a','x',4,true),(5,'a','x',5,true),(6,'b','z',6,true);
CREATE TEMP TABLE first_page AS SELECT id,published FROM review_posts WHERE tenant='a' AND visible ORDER BY published DESC,id DESC LIMIT 2;
INSERT INTO review_posts VALUES (7,'a','x',7,true);
SELECT 'offset_duplicate=' || count(*) FROM (SELECT id FROM review_posts WHERE tenant='a' AND visible ORDER BY published DESC,id DESC OFFSET 2 LIMIT 2) p JOIN first_page USING(id);
SELECT 'keyset_duplicate=' || count(*) FROM (SELECT id FROM review_posts WHERE tenant='a' AND visible AND (published,id)<(4,4) ORDER BY published DESC,id DESC LIMIT 2) p JOIN first_page USING(id);
SELECT 'loaded_slice_target_count=' || count(*) FROM (SELECT * FROM review_posts WHERE tenant='a' AND visible ORDER BY published DESC,id DESC LIMIT 2) p WHERE source='y';
SELECT 'source_filtered_target_count=' || count(*) FROM (SELECT * FROM review_posts WHERE tenant='a' AND visible AND source='y' ORDER BY published DESC,id DESC LIMIT 2) p;
UPDATE review_posts SET visible=false WHERE id=3;
SELECT 'fresh_authorized_page=' || string_agg(id::text,',' ORDER BY published DESC,id DESC) FROM (SELECT * FROM review_posts WHERE tenant='a' AND visible AND (published,id)<(4,4) ORDER BY published DESC,id DESC LIMIT 2) p;
CREATE ROLE review_reader NOLOGIN;
GRANT USAGE ON SCHEMA public TO review_reader;
GRANT SELECT,UPDATE ON review_posts TO review_reader;
ALTER TABLE review_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_posts FORCE ROW LEVEL SECURITY;
CREATE POLICY review_scope ON review_posts TO review_reader USING (tenant='a' AND visible) WITH CHECK (tenant='a' AND visible);
CREATE VIEW review_owner_view AS SELECT * FROM review_posts;
CREATE VIEW review_invoker_view WITH (security_invoker=true) AS SELECT * FROM review_posts;
GRANT SELECT ON review_owner_view,review_invoker_view TO review_reader;
SET ROLE review_reader;
SELECT 'rls_cross_tenant_rows=' || count(*) FROM review_posts WHERE tenant='b';
SELECT 'owner_view_cross_tenant_rows=' || count(*) FROM review_owner_view WHERE tenant='b';
SELECT 'invoker_view_cross_tenant_rows=' || count(*) FROM review_invoker_view WHERE tenant='b';
DO $$ BEGIN
 BEGIN
  UPDATE review_posts SET tenant='b' WHERE id=1;
  RAISE EXCEPTION 'WITH CHECK test unexpectedly allowed forbidden successor';
 EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'with_check_rejected=true';
 END;
END $$;
RESET ROLE;
SELECT 'owner_bypass_cross_tenant_rows=' || count(*) FROM review_posts WHERE tenant='b';
SELECT 'forbidden_update_changed_rows=' || count(*) FROM review_posts WHERE id=1 AND tenant<>'a';
SELECT 'postgres_version=' || current_setting('server_version');
