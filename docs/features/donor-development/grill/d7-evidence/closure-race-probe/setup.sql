
CREATE SCHEMA lab;
CREATE TABLE lab.scope (id integer PRIMARY KEY, accepting boolean NOT NULL);
CREATE TABLE lab.obligation (
  id integer PRIMARY KEY,
  scope_id integer NOT NULL REFERENCES lab.scope(id)
);
INSERT INTO lab.scope VALUES (1,true),(2,true),(3,true);
