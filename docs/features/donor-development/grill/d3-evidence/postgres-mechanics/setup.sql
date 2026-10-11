
CREATE SCHEMA lab;
CREATE TABLE lab.party (tenant integer NOT NULL, id integer NOT NULL, PRIMARY KEY (tenant,id));
CREATE TABLE lab.ministry (tenant integer NOT NULL, entity integer NOT NULL, id integer NOT NULL, PRIMARY KEY (tenant,entity,id));
INSERT INTO lab.party VALUES (1,10),(2,20);
INSERT INTO lab.ministry VALUES (1,100,1000),(1,200,2000),(2,200,3000);
-- Deliberately hypothetical ordinary-lane identity; no application names or lifecycle.
CREATE TABLE lab.journey (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 tenant integer NOT NULL, entity integer NOT NULL, party integer NOT NULL, ministry integer NOT NULL,
 FOREIGN KEY (tenant,party) REFERENCES lab.party(tenant,id) ON DELETE RESTRICT,
 FOREIGN KEY (tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id) ON DELETE RESTRICT,
 UNIQUE(tenant,entity,party,ministry)
);
INSERT INTO lab.journey(tenant,entity,party,ministry) VALUES(1,100,10,1000);
CREATE TABLE lab.check_null (value integer CHECK(value > 0));
CREATE TABLE lab.unique_null (subject integer, optional_key integer, UNIQUE(subject,optional_key));
CREATE TABLE lab.unique_null_equal (subject integer, optional_key integer, UNIQUE NULLS NOT DISTINCT(subject,optional_key));
CREATE TABLE lab.loose_reference (tenant integer, entity integer, ministry integer,
 FOREIGN KEY(tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id));
CREATE TABLE lab.full_reference (tenant integer, entity integer, ministry integer,
 FOREIGN KEY(tenant,entity,ministry) REFERENCES lab.ministry(tenant,entity,id) MATCH FULL);
-- Toy states demonstrate a bad predicate; they are NOT product states.
CREATE TABLE lab.partial_bad (id integer PRIMARY KEY, semantic_key integer NOT NULL, toy_state text NOT NULL);
CREATE UNIQUE INDEX partial_bad_current ON lab.partial_bad(semantic_key) WHERE toy_state='running';
INSERT INTO lab.partial_bad VALUES(1,77,'running');
CREATE TABLE lab.atomic_parent (id integer PRIMARY KEY);
CREATE TABLE lab.atomic_child (id integer PRIMARY KEY, parent integer REFERENCES lab.atomic_parent(id));
CREATE TABLE lab.race (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, semantic_key integer NOT NULL UNIQUE);
CREATE TABLE lab.hidden (id integer PRIMARY KEY, owner_name text NOT NULL);
INSERT INTO lab.hidden VALUES(1,'someone_else');
CREATE ROLE lab_actor;
GRANT USAGE ON SCHEMA lab TO lab_actor;
GRANT SELECT,INSERT ON lab.hidden TO lab_actor;
ALTER TABLE lab.hidden ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.hidden FORCE ROW LEVEL SECURITY;
CREATE POLICY visible_own ON lab.hidden FOR SELECT TO lab_actor USING(owner_name=current_user);
CREATE POLICY insert_own ON lab.hidden FOR INSERT TO lab_actor WITH CHECK(owner_name=current_user);
