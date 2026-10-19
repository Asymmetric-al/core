
CREATE SCHEMA lab;
CREATE TABLE lab.candidate (id integer PRIMARY KEY, matches boolean NOT NULL);
INSERT INTO lab.candidate VALUES (1,true),(2,true);
CREATE TABLE lab.reviewed_member (id integer PRIMARY KEY REFERENCES lab.candidate(id));
INSERT INTO lab.reviewed_member SELECT id FROM lab.candidate WHERE matches;
CREATE TABLE lab.parent (id integer PRIMARY KEY);
CREATE TABLE lab.obligation (id integer PRIMARY KEY, parent_id integer NOT NULL REFERENCES lab.parent(id));
