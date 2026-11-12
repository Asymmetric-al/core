# Pinned scanner implementation excerpts

Verbatim symbol initializers from the local 0.9.18 bundle; formatting only for readability. Offsets and raw text are in scanner-excerpts.json. No scanner execution, private API or code transform was used.

## Su

Bundle UTF-16 offsets 259431-259501; original line 1.

```javascript
const Su = (e) => {
  let t = xu(e);
  return t !== null && (ae.has(t) || t === `observe`) ? t : null;
};
```

## Fde

Bundle UTF-16 offsets 259970-260011; original line 1.

```javascript
const Fde = new Set([...Wt, `useInsertionEffect`]);
```

## nd

Bundle UTF-16 offsets 274690-275153; original line 1.

```javascript
const nd = (e, t) => {
  let n = P(e.callee);
  return !j(n, `MemberExpression`) || n.computed || !j(n.property, `Identifier`)
    ? {
        receiverKey: null,
        registrationVerbName: null,
        eventKey: null,
        handlerKey: null,
      }
    : td(e, `addListener`, t)
      ? {
          receiverKey: $u(n.object, t) ?? Jde(n.object, e, t),
          registrationVerbName: n.property.name,
          eventKey: null,
          handlerKey: $u(e.arguments?.[0], t),
        }
      : {
          receiverKey: Iu(n.object, t),
          registrationVerbName: n.property.name,
          eventKey: Iu(e.arguments?.[0], t),
          handlerKey: Iu(e.arguments?.[1], t),
        };
};
```

## Xde

Bundle UTF-16 offsets 275839-276336; original line 1.

```javascript
const Xde = (e, t) => {
  let n = au(e, t.scopes),
    r = [...n];
  for (; r.length > 0;) {
    let e = r.pop();
    !e ||
      !F(e) ||
      b(e.body, (i) => {
        if (i !== e.body && F(i)) return !1;
        if (!j(i, `CallExpression`)) return;
        let a = null;
        if (j(i.callee, `Identifier`) && Vl(i.callee, t.scopes)) {
          let e = i.arguments?.[0];
          a = e && A(e) ? e : null;
        } else {
          let e = i.arguments?.find((e) => A(e) && ru(e) === i);
          e && A(e) && (a = e);
          let n = Su(i);
          n !== null &&
            (a = rd({
              kind: `subscribe`,
              node: i,
              resourceName: n,
              handleKey: null,
              ...nd(i, t),
            }));
        }
        let o = a ? C(a, t.scopes) : null;
        !o || n.has(o) || (n.add(o), r.push(o));
      });
  }
  return n;
};
```

## Zde

Bundle UTF-16 offsets 276337-277326; original line 1.

```javascript
const Zde = (e, t) => {
  let n = [];
  if (!j(e, `ArrowFunctionExpression`) && !j(e, `FunctionExpression`)) return n;
  let r = null;
  if (j(e.body, `BlockStatement`)) {
    let t = e.body.body ?? [],
      n = t[t.length - 1];
    j(n, `ReturnStatement`) && n.argument && (r = n.argument);
  }
  let i = Xde(e, t);
  return (
    b(e, (a) => {
      if (a !== e && F(a) && (a === r || (!i.has(a) && !tu(a)))) return !1;
      if (Nu(a)) {
        n.push({
          kind: `socket`,
          node: a,
          resourceName: j(a.callee, `Identifier`) ? a.callee.name : `WebSocket`,
          handleKey: Ku(a, t, !0),
          receiverKey: null,
          registrationVerbName: null,
          eventKey: null,
          handlerKey: null,
        });
        return;
      }
      if (!j(a, `CallExpression`)) return;
      if (j(a.callee, `Identifier`) && Vl(a.callee, t.scopes)) {
        if (a.callee.name === `setTimeout` && (qf(a) || Jf(a, t))) return;
        n.push({
          kind: `timer`,
          node: a,
          resourceName: a.callee.name,
          handleKey: Ku(a, t, !0),
          receiverKey: null,
          registrationVerbName: a.callee.name,
          eventKey: null,
          handlerKey: null,
        });
        return;
      }
      let o = Su(a);
      if (o !== null) {
        let e = nd(a, t);
        n.push({
          kind: `subscribe`,
          node: a,
          resourceName: o,
          handleKey: (o === `on` ? Yde(a, t) : null) ?? Ku(a, t, !0),
          ...e,
        });
      }
    }),
    n.filter((e) => W(e.node, t))
  );
};
```

## ad

Bundle UTF-16 offsets 277327-277507; original line 1.

```javascript
const ad = (e, t, n) => {
  let r = e,
    i = T(r);
  for (
    ;
    i &&
    tu(i) &&
    !(t.length > 0 && t.every((e) => n.cfg.enclosingFunction(e) === i));
  ) {
    let e = i.parent;
    if (!j(e, `CallExpression`)) break;
    ((r = e), (i = T(r)));
  }
  return Ya(r, t, n, e);
};
```

## Qde

Bundle UTF-16 offsets 277508-277877; original line 1.

```javascript
const Qde = (e, t, n) => {
  if (
    (!j(e, `ArrowFunctionExpression`) && !j(e, `FunctionExpression`)) ||
    !j(e.body, `BlockStatement`)
  )
    return t;
  let r = [];
  return (
    bu(e.body, (e) => {
      j(j(e, `ChainExpression`) ? e.expression : e, `CallExpression`) &&
        r.push(e);
    }),
    r.length === 0
      ? t
      : t.filter((e) => {
          let t = w(e.node);
          if (t === null) return !0;
          let i = r.filter((r) => {
            let i = w(r);
            return i !== null && i > t && Ff(r, e, n);
          });
          return !ad(e.node, i, n);
        })
  );
};
```

## Od

Bundle UTF-16 offsets 287775-288589; original line 1.

```javascript
const Od = (e, t, n = new Set()) => {
  if (!e) return null;
  let r = P(e);
  if (!j(r, `Identifier`)) return r;
  let i = t.scopes.symbolFor(r),
    a =
      (i?.kind === `let` || i?.kind === `var`) &&
      j(i.declarationNode, `VariableDeclarator`) &&
      i.declarationNode.id === i.bindingIdentifier &&
      i.references.every((e) => e.flag === `read` && !Tu(e.identifier)) &&
      i.scope.symbols.filter((e) => e.name === i.name).length === 1,
    o =
      i?.kind === `function` && F(i.declarationNode)
        ? t.scopes
            .ownScopeFor(i.declarationNode)
            ?.symbols.find(
              (e) =>
                e.name === i.name && e.declarationNode === i.declarationNode,
            )
        : null,
    s =
      i?.kind === `function` &&
      i.references.every((e) => e.flag === `read` && !Tu(e.identifier)) &&
      (!o ||
        o.references.every((e) => e.flag === `read` && !Tu(e.identifier))) &&
      i.scope.symbols.filter((e) => e.name === i.name).length === 1;
  return !i || (i.kind !== `const` && !a && !s) || !i.initializer || n.has(i.id)
    ? r
    : (n.add(i.id), Od(i.initializer, t, n));
};
```

## Id

Bundle UTF-16 offsets 292919-292999; original line 1.

```javascript
const Id = (e, t, n, r) => {
  let i = T(e);
  return !i || i === t ? e : (Nd(i, t, n) ?? (r ? ofe(i, t, r, n) : null) ?? e);
};
```

## sfe

Bundle UTF-16 offsets 293000-293280; original line 1.

```javascript
const sfe = (e, t, n) => {
  if (!F(e)) return [];
  let r = ec(e),
    i = q(r, n);
  if (!i) return [];
  let a = [];
  return (
    b(t, (e) => {
      if (e !== t && F(e)) return !1;
      let o = j(e, `CallExpression`) ? e.arguments[1] : null;
      j(e, `CallExpression`) &&
        Zn(e) === `addEventListener` &&
        (q(o, n) === i || (j(o, `Identifier`) && o.name === r?.name)) &&
        a.push(e);
    }),
    a
  );
};
```

## Rd

Bundle UTF-16 offsets 294981-296364; original line 1.

```javascript
const Rd = (e, t, n, r = new Set(), i = new Map(), a = !1) => {
  if (!F(e) || r.has(e)) return !1;
  r.add(e);
  let o = !1,
    s = [];
  b(e.body, (c) => {
    if (o || (c !== e.body && F(c) && !tu(c))) return !1;
    let l = j(c, `ChainExpression`) ? c.expression : c;
    if (lfe(c, t, n)) {
      if (a) {
        s.push(c);
        return;
      }
      return ((o = !0), !1);
    }
    if (Ff(c, t, n, i)) {
      let r = jd(c),
        u = j(l, `CallExpression`) ? P(l.callee) : null,
        d = j(u, `MemberExpression`) ? u.object : u,
        f = od(d, n),
        p = $de(d, n),
        m = gd(d, n),
        h = Dd(t, n) ?? Ed(t.node, n);
      if (p !== null && T(c) !== e) {
        let e = T(c);
        r &&
          e &&
          F(e) &&
          h !== null &&
          m.has(h) &&
          Xa(e, [c], n) &&
          !Nf(t.node, c, m, n) &&
          s.push(r);
        return;
      }
      let g = od(j(l, `CallExpression`) ? l.arguments?.[0] : null, n) ?? f;
      if (!g) {
        if (a) {
          let r = Gd(c, e, t, n, i);
          s.push(r ?? c);
          return;
        }
        return ((o = !0), !1);
      }
      let _ = wd(
        c,
        t.kind === `subscribe` &&
          t.registrationVerbName === `addEventListener` &&
          j(t.node, `CallExpression`)
          ? new Set(
              [
                P(t.node.callee),
                t.node.arguments?.[0],
                t.node.arguments?.[1],
                t.node.arguments?.[2],
              ].flatMap((e) => {
                let t = j(e, `MemberExpression`)
                  ? Pu(e.object, n)
                  : A(e)
                    ? Pu(e, n)
                    : null;
                return t ? [t.collectionKey] : [];
              }),
            )
          : new Set(),
        n,
      );
      !e.async &&
        !e.generator &&
        (Cd(c, g, n) || _ !== null) &&
        (h === null || m.size === 0 || (m.has(h) && !Nf(t.node, c, m, n))) &&
        s.push(_ ?? g);
      return;
    }
    if (!j(l, `CallExpression`)) return;
    let u = Od(l.callee, n),
      d = j(u, `Identifier`) ? cfe(u, t, n) : u ? Bf(u, n) : null,
      f = d && F(d) ? Ld(d, l, n, i) : null;
    if (
      d &&
      F(d) &&
      f &&
      !d.async &&
      !d.generator &&
      Rd(d, t, n, new Set(r), f, a)
    ) {
      let r = Gd(c, e, t, n, i) ?? dfe(c, e, t, n);
      s.push(r ?? l);
    }
  });
  let c = x(e.body);
  return a && s.some((e) => x(e) === c) ? !0 : o || Xa(e, s, n);
};
```

## mfe

Bundle UTF-16 offsets 303295-303388; original line 1.

```javascript
const mfe = (e, t, n) =>
  t.handleKey !== null &&
  pfe(e, t, n) &&
  ffe(e, t, n, t.registrationVerbName === `setTimeout`);
```

## mf

Bundle UTF-16 offsets 316459-317944; original line 1.

```javascript
const mf = (e, t, n, r, i) => {
  let a = T(t.node),
    o = x(t.node),
    s = o.parent,
    c =
      t.handleKey !== null &&
      j(s, `AssignmentExpression`) &&
      s.operator === `=` &&
      s.right === o
        ? wfe(s.left, e, i)
        : null,
    l = Dfe(e, t, i);
  if (
    t.kind !== `timer` ||
    !a ||
    !F(a) ||
    a === e ||
    a.async ||
    a.generator ||
    (!c && !l) ||
    !zd(r, t, i) ||
    (c && j(s, `AssignmentExpression`) && !pf(t, c, s, n, i))
  )
    return !1;
  if (ff(a, t, n, i)) return !0;
  let u = ec(a),
    d = u ? i.scopes.symbolFor(u) : null;
  if (!d || d.references.length === 0) return !1;
  let f = d.references.length === 1 ? Md(d.references[0].identifier) : null,
    p = Ofe(t, a, n, i);
  if (c && !p && !of(a, t, i) && !f && !Efe(e, t, a, d, i)) return !1;
  let m = t.node.parent;
  for (; m && m !== a;) {
    if (
      c &&
      (j(m, `ForStatement`) ||
        j(m, `ForInStatement`) ||
        j(m, `ForOfStatement`) ||
        j(m, `WhileStatement`) ||
        j(m, `DoWhileStatement`))
    )
      return !1;
    m = m.parent;
  }
  let h = d.references.filter(
    (e) => p && V(e.identifier, t.node) && sf(t, i) === q(e.identifier, i),
  );
  if (p && (h.length !== 1 || d.references.length !== 2)) return !1;
  let g = ou(e, i.scopes);
  return d.references.every((o) => {
    let s = q(o.identifier, i),
      c = x(o.identifier).parent;
    if (h.some((e) => e === o)) return !0;
    let l = n.find(
        (e) =>
          e !== t &&
          s !== null &&
          sf(e, i) === s &&
          (V(o.identifier, e.node) || (c && Ff(c, e, i))),
      ),
      u = l ? rd(l) : null;
    if (l && !(u && F(u) && u.async) && lf(e, l, r, i)) return !0;
    let d = Md(o.identifier);
    if (!d) return !1;
    let f = T(d);
    if (!f || !F(f) || f === a || f.generator) return !1;
    if (f.async) return _fe(e, f, d, r, i);
    if (ff(f, t, n, i)) return !0;
    if (f === e) return ad(Id(d, e, i), r, i);
    let p = cf(f, i),
      m = n.find((e) => {
        if (e === t) return !1;
        let n = rd(e),
          r = n ? Od(n, i) : null;
        return p.has(sf(e, i) ?? ``) || r === f;
      });
    return m ? lf(e, m, r, i) : g.has(f) && ad(Id(d, e, i), r, i);
  });
};
```

## jfe

Bundle UTF-16 offsets 319282-321383; original line 1.

```javascript
const jfe = (e, t, n, r) => {
  if (Afe(e, t, n, r)) return !0;
  let i = T(t.node),
    a = i ? ru(i) : null;
  if (
    t.kind !== `timer` ||
    t.handleKey === null ||
    !i ||
    !F(i) ||
    i === e ||
    i.async ||
    i.generator ||
    !j(t.node, `CallExpression`) ||
    !j(t.node.callee, `Identifier`) ||
    !r.scopes.isGlobalReference(t.node.callee) ||
    !a ||
    !au(e, r.scopes).has(i) ||
    !ad(a, n, r)
  )
    return !1;
  let o = x(t.node),
    s = o.parent;
  if (
    !j(s, `AssignmentExpression`) ||
    s.operator !== `=` ||
    s.right !== o ||
    !j(s.left, `Identifier`)
  )
    return !1;
  let c = r.scopes.symbolFor(s.left);
  if (
    !c ||
    (c.kind !== `let` && c.kind !== `var`) ||
    !j(c.declarationNode, `VariableDeclarator`) ||
    T(c.declarationNode) !== e
  )
    return !1;
  let l = n.flatMap((e) => {
    if (!j(e, `ReturnStatement`) || !e.argument) return [];
    let t = Od(e.argument, r);
    return t && F(t) ? [t] : [];
  });
  if (l.length !== n.length) return !1;
  let u = new Map();
  for (let e of l) {
    if (!F(e)) return !1;
    let n = [];
    if (
      (b(e.body, (i) => {
        if (i !== e.body && F(i)) return !1;
        if (
          j(i, `CallExpression`) &&
          j(i.callee, `Identifier`) &&
          r.scopes.isGlobalReference(i.callee) &&
          Ff(i, t, r)
        ) {
          let a = Gd(i, e, t, r);
          n.push({ anchor: a ?? i, call: i, handleGuard: a });
        }
      }),
      !Xa(
        e,
        n.map((e) => e.anchor),
        r,
      ))
    )
      return !1;
    u.set(e, n);
  }
  let d = c.references.filter((e) => Tu(e.identifier)),
    f = d.some((e) => x(e.identifier).parent === s),
    p = t.node.arguments,
    m = d.some((e) => {
      let t = x(e.identifier),
        n = t.parent;
      if (n === s) return !1;
      if (!j(n, `AssignmentExpression`) || n.operator !== `=` || n.left !== t)
        return !0;
      let i = P(n.right);
      if (!(
        (j(i, `Literal`) && i.value === null) ||
        (j(i, `Identifier`) &&
          i.name === `undefined` &&
          r.scopes.isGlobalReference(i))
      ))
        return !0;
      let a = T(n);
      if (
        a &&
        F(a) &&
        p.some((e) => {
          let t = P(e);
          return F(t) && t === a;
        })
      )
        return !1;
      let o = T(n),
        c = o ? u.get(o) : void 0;
      return !(
        o &&
        c &&
        Vf(
          n,
          c.map((e) =>
            e.handleGuard && V(n, e.handleGuard.consequent) ? e.call : e.anchor,
          ),
          o,
          r,
        )
      );
    });
  if (!f || m) return !1;
  let h = t.node.parent;
  for (; h && h !== i;) {
    if (
      j(h, `ForStatement`) ||
      j(h, `ForInStatement`) ||
      j(h, `ForOfStatement`) ||
      j(h, `WhileStatement`) ||
      j(h, `DoWhileStatement`)
    )
      return !1;
    h = h.parent;
  }
  let g = !1;
  for (let e of t.node.arguments ?? [])
    b(e, (e) => {
      if (g || F(e)) return !1;
      if (
        j(e, `AwaitExpression`) ||
        j(e, `YieldExpression`) ||
        (j(e, `CallExpression`) && !no(e, r.scopes))
      )
        return ((g = !0), !1);
    });
  return g
    ? !1
    : Xd(i, t.node, r).some(
        (a) =>
          $d(e, a, l, r) &&
          !ef(i, a, t.node, r) &&
          !Qd(i, t.node, a, r) &&
          n.every((e) => Zd(e, a, r)),
      );
};
```

## Mfe

Bundle UTF-16 offsets 321384-323728; original line 1.

```javascript
const Mfe = (e, t, n) => {
  if (!F(e) || !j(e.body, `BlockStatement`)) return !1;
  let r = new Set();
  if (
    (b(e.body, (e) => {
      if (!j(e, `CallExpression`)) return;
      let i = P(e.callee);
      if (
        !j(i, `MemberExpression`) ||
        Zn(e) !== `push` ||
        !j(i.object, `Identifier`)
      )
        return;
      let a = e.arguments[0];
      if (!a || !A(a)) return;
      let o = P(a),
        s = F(o) ? o : Od(a, n);
      if (!s || !F(s)) return;
      let c = !1;
      if (
        (b(s.body, (e) => {
          if (c || (e !== s.body && F(e))) return c ? !1 : void 0;
          if (!j(e, `CallExpression`)) return;
          let r = P(e.callee);
          if (!j(r, `MemberExpression`)) return;
          let i = j(t.node, `CallExpression`) ? t.node : null;
          if (
            Zn(e) === `removeEventListener` &&
            i &&
            Iu(r.object, n) === t.receiverKey &&
            Iu(e.arguments[0], n) === t.eventKey &&
            Iu(e.arguments[1], n) === t.handlerKey &&
            zu(i.arguments[2], e.arguments[2], n, !0)
          )
            return ((c = !0), !1);
        }),
        !c)
      )
        return;
      let l = x(t.node),
        u = l.parent,
        d = x(e),
        f = d.parent;
      if (
        !u ||
        !j(u, `ExpressionStatement`) ||
        u.expression !== l ||
        !f ||
        !j(f, `ExpressionStatement`) ||
        f.expression !== d ||
        !u.parent ||
        !j(u.parent, `BlockStatement`) ||
        u.parent !== f.parent
      )
        return;
      let p = u.parent.body.findIndex((e) => e.range[0] === u.range[0]);
      if (u.parent.body.findIndex((e) => e.range[0] === f.range[0]) !== p + 1)
        return;
      let m = n.scopes.symbolFor(i.object),
        h = m?.initializer ? P(m.initializer) : null;
      m?.kind !== `const` ||
        !h ||
        !j(h, `ArrayExpression`) ||
        h.elements.length !== 0 ||
        (m.references.every((e) => {
          let t = x(e.identifier);
          if (
            j(t.parent, `ForOfStatement`) &&
            t.parent.right === t &&
            t.parent.await !== !0
          )
            return !0;
          let n = t.parent;
          if (!n || !j(n, `MemberExpression`) || n.object !== t) return !1;
          let r = x(n).parent;
          return !!(
            r &&
            j(r, `CallExpression`) &&
            r.callee === n &&
            [`forEach`, `push`].includes(k(n) ?? ``)
          );
        }) &&
          r.add(m));
    }),
    r.size === 0)
  )
    return !1;
  let i = !1;
  return (
    bu(e.body, (e) => {
      if (i || !j(e, `ReturnStatement`) || !e.argument) return;
      let t = P(e.argument),
        a = F(t) ? t : Od(e.argument, n);
      !a ||
        !F(a) ||
        b(a.body, (e) => {
          if (i) return !1;
          if (!j(e, `CallExpression`)) return;
          let t = P(e.callee);
          if (j(t, `Identifier`)) {
            let a = od(t, n),
              o = a ? P(a.right) : null,
              s = j(o, `Identifier`) ? n.scopes.symbolFor(o) : null;
            if (a && s && r.has(s) && Cd(e, a, n)) return ((i = !0), !1);
          }
          if (
            !j(t, `MemberExpression`) ||
            Zn(e) !== `forEach` ||
            !j(t.object, `Identifier`)
          )
            return;
          let a = n.scopes.symbolFor(t.object);
          if (!a || !r.has(a)) return;
          let o = e.arguments[0];
          if (!o || !A(o)) return;
          let s = P(o);
          if (!F(s)) return;
          let c = s.params[0];
          if (!c || !j(c, `Identifier`)) return;
          let l = n.scopes.symbolFor(c);
          return (
            b(s.body, (e) => {
              if (
                j(e, `CallExpression`) &&
                j(P(e.callee), `Identifier`) &&
                n.scopes.symbolFor(P(e.callee))?.id === l?.id
              )
                return ((i = !0), !1);
            }),
            i ? !1 : void 0
          );
        });
    }),
    i
  );
};
```

## Nfe

Bundle UTF-16 offsets 323729-324503; original line 1.

```javascript
const Nfe = (e, t, n) => {
  if (
    t.registrationVerbName !== `addEventListener` ||
    !j(t.node, `CallExpression`)
  )
    return !1;
  let r = P(t.node.callee);
  if (!j(r, `MemberExpression`)) return !1;
  let i = [
      r.object,
      t.node.arguments[0],
      t.node.arguments[1],
      t.node.arguments[2],
    ],
    a = new Set(
      i.flatMap((e) => {
        let t = Pu(e, n);
        return t ? [t.collectionKey] : [];
      }),
    );
  if (a.size === 0) return !1;
  let o = Iu(r.object, n),
    s = Iu(t.node.arguments[0], n),
    c = Iu(t.node.arguments[1], n),
    l = Ru(t.node.arguments[2], n, !0),
    u = !1;
  return (
    b(e, (e) => {
      if (u || !j(e, `CallExpression`)) return u ? !1 : void 0;
      if (Zn(e) !== `removeEventListener`) return;
      let r = P(e.callee);
      if (
        j(r, `MemberExpression`) &&
        !(
          Iu(r.object, n) !== o ||
          Iu(e.arguments[0], n) !== s ||
          Iu(e.arguments[1], n) !== c ||
          Ru(e.arguments[2], n, !0) !== l
        ) &&
        jf(e, a, n) &&
        !Nf(t.node, e, new Map([...a].map((e) => [e, 1 / 0])), n)
      )
        return ((u = !0), !1);
    }),
    u
  );
};
```

## Lfe

Bundle UTF-16 offsets 328998-330418; original line 1.

```javascript
const Lfe = (e, t, n, r, i) => {
  if (
    t.registrationVerbName !== `observe` ||
    !j(t.node, `CallExpression`) ||
    !j(t.node.callee, `MemberExpression`)
  )
    return !1;
  let a = P(t.node.callee.object),
    o = j(a, `Identifier`) ? i.scopes.symbolFor(a) : null,
    s = T(t.node);
  if (
    !o ||
    !s ||
    !F(s) ||
    s === e ||
    s.async ||
    s.generator ||
    T(o.declarationNode) !== e ||
    !Fd(o.initializer, i) ||
    !zd(r, t, i)
  )
    return !1;
  let c = o.references.flatMap((e) => {
    let t = e.identifier.parent;
    return j(t, `AssignmentExpression`) &&
      t.left === e.identifier &&
      t.operator === `=` &&
      Pd(P(t.right), i)
      ? [t]
      : [];
  });
  if (c.length !== 1) return !1;
  let l = c[0];
  if (
    !l ||
    T(l) !== s ||
    !Fi(l, t.node, i) ||
    !pf({ ...t, node: l.right, handleKey: t.receiverKey }, o, l, n, i)
  )
    return !1;
  let u = (e) =>
      j(e, `LogicalExpression`) && e.operator === `||`
        ? u(e.left) || u(e.right)
        : q(e, i) === t.receiverKey,
    d = !1;
  if (
    (b(s.body, (e) => {
      if (e !== s.body && F(e)) return !1;
      j(e, `IfStatement`) &&
        u(P(e.test)) &&
        !Ul(e.consequent, l, s, i) &&
        Fi(e, l, i) &&
        (d = !0);
    }),
    !d)
  )
    return !1;
  let f = ec(s),
    p = f ? i.scopes.symbolFor(f) : null;
  return !p || p.references.length === 0
    ? !1
    : p.references.every((a) => {
        let o = Md(a.identifier),
          s = o ? T(o) : null;
        if (!o || !s || !F(s) || s.async || s.generator) return !1;
        if (s === e) return ad(o, r, i);
        let c = ec(s),
          l = c ? i.scopes.symbolFor(c) : null;
        if (!l || l.references.length === 0) return !1;
        let u = q(c, i),
          d = n.filter(
            (n) =>
              n !== t &&
              n.handlerKey === u &&
              n.registrationVerbName === `addEventListener` &&
              T(n.node) === e,
          );
        return (
          d.length > 0 &&
          d.every((t) => lf(e, t, r, i)) &&
          l.references.every((e) => {
            let t = e.identifier.parent;
            return d.some((e) => e.node === t || (t && Ff(t, e, i)));
          })
        );
      });
};
```

## Rfe

Bundle UTF-16 offsets 330419-332326; original line 1.

```javascript
const Rfe = (e, t, n, r) => {
  let i = T(t.node);
  if (
    t.kind !== `subscribe` ||
    t.registrationVerbName !== `observe` ||
    t.receiverKey === null ||
    !i ||
    !F(e) ||
    !j(e.body, `BlockStatement`)
  )
    return !1;
  let a = [];
  if (
    (bu(e.body, (e) => {
      if (!j(e, `ReturnStatement`) || !e.argument) return;
      let r = Bf(e.argument, n);
      if (!r || !F(r)) return;
      let i = [];
      (b(r.body, (e) => {
        if (e !== r.body && F(e)) return !1;
        let a = j(e, `ChainExpression`) ? e.expression : e,
          o = j(a, `CallExpression`) ? P(a.callee) : null;
        j(a, `CallExpression`) &&
          j(o, `MemberExpression`) &&
          !o.computed &&
          j(o.property, `Identifier`) &&
          o.property.name === `disconnect` &&
          q(o.object, n) === t.receiverKey &&
          i.push(e);
      }),
        Xa(r, i, n) && a.push(e));
    }),
    tu(i))
  )
    return ad(t.node, a, n);
  let o =
      j(t.node, `CallExpression`) && j(t.node.callee, `MemberExpression`)
        ? P(t.node.callee.object)
        : null,
    s = j(o, `Identifier`) ? n.scopes.symbolFor(o) : null;
  if (!s || T(s.declarationNode) !== e) return !1;
  if (i === e)
    return (
      s.kind === `const` &&
      !!(s.initializer && Pd(P(s.initializer), n)) &&
      Xa(e, a, n)
    );
  if (!F(i) || i.async || i.generator || !Fd(s.initializer, n)) return !1;
  let c = s.references.filter((e) => e.flag !== `read`);
  if (c.length !== 1) return !1;
  let l = x(c[0].identifier).parent;
  if (
    !j(l, `AssignmentExpression`) ||
    l.operator !== `=` ||
    T(l) !== i ||
    !Pd(P(l.right), n) ||
    l.parent?.parent !== i.body
  )
    return !1;
  let u = ec(i),
    d = u ? n.scopes.symbolFor(u) : null;
  if (!d || d.references.length !== 2) return !1;
  let f = d.references.flatMap((t) => {
    let n = Md(t.identifier);
    return n && T(n) === e ? [n] : [];
  });
  if (f.length !== 1 || f[0].parent?.parent !== e.body || !ad(f[0], a, n))
    return !1;
  let p = d.references.find((e) => !Md(e.identifier)),
    m = p && x(p.identifier).parent;
  if (
    !j(m, `CallExpression`) ||
    !j(m.callee, `Identifier`) ||
    m.callee.name !== `requestAnimationFrame` ||
    !n.scopes.isGlobalReference(m.callee) ||
    m.arguments[0] !== p?.identifier ||
    T(m) !== i
  )
    return !1;
  let h = {
    kind: `timer`,
    node: m,
    resourceName: `requestAnimationFrame`,
    registrationVerbName: `requestAnimationFrame`,
    handleKey: Ku(m, n),
    receiverKey: null,
    eventKey: null,
    handlerKey: null,
  };
  return !Ul(m, l, i, n) && !Ul(l, m, i, n) && mf(e, h, [...r, h], a, n);
};
```

## zfe

Bundle UTF-16 offsets 332327-332439; original line 1.

```javascript
const zfe = (e, t, n) =>
  Hl({
    context: n,
    effectCallback: e,
    resourceNode: t.node,
    doesFunctionReleaseResource: (e) => F(e) && Rd(e, t, n),
  });
```

## bf

Bundle UTF-16 offsets 332440-333866; original line 1.

```javascript
const bf = (e, t, n, r = [t]) => {
  if (
    (!j(e, `ArrowFunctionExpression`) && !j(e, `FunctionExpression`)) ||
    e.async
  )
    return !1;
  if (
    Mfe(e, t, n) ||
    Nfe(e, t, n) ||
    Rfe(e, t, n, r) ||
    zfe(e, t, n) ||
    yf(t, n) ||
    Kf(e, t, n) ||
    (t.kind === `subscribe` &&
      T(t.node) === e &&
      Xf(t.node, !0, !0, n) &&
      Xu(t, n))
  )
    return !0;
  if (!j(e.body, `BlockStatement`)) return e.body === t.node && Xu(t, n);
  let i = x(t.node),
    a = i.parent,
    o =
      j(a, `AssignmentExpression`) &&
      a.operator === `=` &&
      a.right === i &&
      j(a.left, `Identifier`)
        ? n.scopes.symbolFor(a.left)
        : null,
    s =
      (t.kind === `subscribe` && t.registrationVerbName === `observe`) ||
      (t.kind === `timer` &&
        ((T(t.node) === e && j(a, `VariableDeclarator`)) ||
          !!(
            o &&
            (o.kind === `let` || o.kind === `var`) &&
            j(o.declarationNode, `VariableDeclarator`) &&
            T(o.declarationNode) === e
          ))),
    c = [];
  if (
    (bu(e.body, (e) => {
      if (!j(e, `ReturnStatement`)) return;
      let r = w(e),
        i = w(t.node);
      if (r !== null && i !== null && r < i) return;
      let a = e.argument ? P(e.argument) : null;
      if (!a) return;
      if (Bd(a, t, n)) {
        c.push(e);
        return;
      }
      if (
        t.kind === `subscribe` &&
        (a === t.node || (w(a) !== null && w(a) === w(t.node))) &&
        Xu(t, n)
      ) {
        c.push(e);
        return;
      }
      if (t.kind === `subscribe` && qde(a, t, n)) {
        c.push(e);
        return;
      }
      if (
        j(a, `Identifier`) &&
        ((a.name === `undefined` && n.scopes.isGlobalReference(a)) ||
          !n.scopes.symbolFor(a)?.initializer)
      )
        return;
      let o = Od(a, n);
      if (o && Bd(o, t, n)) {
        c.push(e);
        return;
      }
      !o || !F(o) || (Rd(o, t, n, new Set(), new Map(), s) && c.push(e));
    }),
    Lfe(e, t, r, c, n) || jfe(e, t, c, n) || mf(e, t, r, c, n))
  )
    return !0;
  let l = T(t.node),
    u = l ? sfe(l, e, n) : [];
  return t.kind === `subscribe` && u.length > 0 && u.every((e) => ad(e, c, n))
    ? !0
    : ad(Id(t.node, e, n, t), c, n);
};
```

## Bfe

Bundle UTF-16 offsets 333867-333946; original line 1.

```javascript
const Bfe = (e, t, n) => {
  for (let r of t) if (!bf(e, r, n, t) && !mfe(e, r, n)) return r;
  return null;
};
```

## Sf

Bundle UTF-16 offsets 334756-335151; original line 1.

```javascript
const Sf = new Map([
  [`addEventListener`, new Set([`removeEventListener`, `abort`])],
  [`addListener`, new Set([`removeListener`, `off`, `abort`])],
  [`on`, new Set([`off`, `removeListener`, `on`])],
  [`subscribe`, new Set([`unsubscribe`, `unsub`])],
  [`sub`, new Set([`unsub`, `unsubscribe`])],
  [`watch`, new Set([`unwatch`, `close`])],
  [`listen`, new Set([`unlisten`, `close`])],
  [`observe`, new Set([`disconnect`, `unobserve`])],
]);
```

## Ff

Bundle UTF-16 offsets 345123-349545; original line 1.

```javascript
const Ff = (e, n, r, i = new Map()) => {
  let a = j(e, `ChainExpression`) ? e.expression : e;
  if (!j(a, `CallExpression`)) return !1;
  let o = P(a.callee);
  if (n.kind === `timer`) {
    if (
      !j(o, `Identifier`) ||
      !(n.registrationVerbName === `requestAnimationFrame`
        ? o.name === `cancelAnimationFrame`
        : m.has(o.name)) ||
      !r.scopes.isGlobalReference(o)
    )
      return !1;
    let e = q(a.arguments?.[0], r, new Set(), i);
    if (qu(e, n, r)) return !0;
    if (i.size > 0 && e !== null) return !1;
    let t = a.arguments?.[0];
    if (t && A(t)) {
      let e = Gu(t, a, r);
      if (n.handleKey && e?.has(n.handleKey)) return !0;
    }
    let s = Ed(n.node, r);
    return s !== null && s === pd(a.arguments?.[0], r);
  }
  if (
    j(o, `Identifier`) &&
    n.kind === `subscribe` &&
    ((Zu(o, n, r) &&
      ((n.registrationVerbName !== `addEventListener` &&
        n.registrationVerbName !== `addListener`) ||
        Xu(n, r))) ||
      (n.registrationVerbName === `addListener` && _d(o, n, r)))
  )
    return !0;
  let s = Tf(a);
  if (
    !s ||
    !j(o, `MemberExpression`) ||
    o.computed ||
    !j(o.property, `Identifier`)
  )
    return !1;
  let c = Iu(o.object, r),
    l = a.arguments[0];
  if (
    s === `unsubscribe` &&
    n.registrationVerbName === `subscribe` &&
    a.arguments.length === 2 &&
    Tde(o.object, r)
  ) {
    let e = T(n.node),
      t = T(a);
    if (e && t) {
      let i = Xd(e, n.node, r),
        o = Xd(t, a, r).filter((e) => !V(a, e.guardNode)),
        s = a,
        c = a.parent;
      for (; c && c !== t;) {
        if (
          j(c, `LogicalExpression`) ||
          j(c, `ConditionalExpression`) ||
          j(c, `SwitchCase`) ||
          j(c, `ForStatement`) ||
          j(c, `ForOfStatement`) ||
          j(c, `ForInStatement`) ||
          j(c, `WhileStatement`)
        )
          return !1;
        (j(c, `IfStatement`) && o.push(...Yd(c.test, c.alternate === s, c, r)),
          (s = c),
          (c = c.parent));
      }
      o.every(
        (e) =>
          i.some((t) => t.key === e.key && t.value === e.value) &&
          !!(
            e.bindingIdentifier &&
            r.scopes
              .symbolFor(e.bindingIdentifier)
              ?.references.every((e) => e.flag === `read`)
          ),
      ) && (l = a.arguments[1]);
    }
  }
  let u = Iu(l, r),
    d = n.registrationVerbName ? Sf.get(n.registrationVerbName) : null,
    f = Dd(n, r),
    p = od(o.object, r),
    h = p ? q(p.right, r) : pd(o.object, r);
  if (
    (d &&
      If(s, d) &&
      f !== null &&
      f === h &&
      (s !== `unobserve` || (n.eventKey !== null && u === n.eventKey))) ||
    Yfe(a, n, r) ||
    Xfe(a, n, r) ||
    Qu(c, s, n, r)
  )
    return !0;
  if (n.kind === `socket`) return qu(c, n, r) && (wf.has(s) || Cf.has(s));
  if (
    (n.kind === `subscribe` &&
      j(n.node, `CallExpression`) &&
      (s === `removeChannel` || s === `removeAllChannels`) &&
      c === id(n.node, r) &&
      (s === `removeAllChannels` ||
        qu(q(a.arguments?.[0], r, new Set(), i), n, r))) ||
    ((qu(c, n, r) || (n.kind === `subscribe` && _d(o.object, n, r))) &&
      (s === `unsubscribe` ||
        s === `unsub` ||
        s === `close` ||
        s === `unwatch` ||
        s === `unlisten` ||
        t.has(s))) ||
    (s === `abort` && c === (kd(n, r) ?? ife(n, r) ?? afe(n, r))) ||
    (s === `abort` && Wfe(o.object, n, r))
  )
    return !0;
  if (
    n.registrationVerbName === `addListener` &&
    s === `removeListener` &&
    j(n.node, `CallExpression`) &&
    n.node.arguments?.length === 1
  ) {
    if (a.arguments?.length !== 1) return !1;
    let e = Od(n.node.arguments[0], r);
    if (!td(n.node, `addListener`, r) && !F(e)) return !1;
  }
  if (
    (n.registrationVerbName === `addEventListener` &&
      s === `removeEventListener` &&
      j(n.node, `CallExpression`) &&
      (!j(P(n.node.callee), `MemberExpression`) ||
        !zu(n.node.arguments?.[2], a.arguments?.[2], r, !0))) ||
    (j(n.node, `CallExpression`) && !Zfe(n.node, a, r))
  )
    return !1;
  let g = j(n.node, `CallExpression`) ? P(n.node.callee) : null,
    _ = j(g, `MemberExpression`) ? vd(g.object, r) : null,
    v = vd(o.object, r);
  if (
    !(_ !== null && _ === v) &&
    (n.receiverKey === null || c !== n.receiverKey)
  )
    return !1;
  if (
    n.registrationVerbName === `subscribe` &&
    (s === `unsubscribe` || s === `unsub`) &&
    n.handleKey !== null &&
    q(a.arguments?.[0], r) === n.handleKey
  )
    return !0;
  let y = n.registrationVerbName ? Sf.get(n.registrationVerbName) : null;
  if (!y || !If(s, y)) return !1;
  let ee = j(n.node, `CallExpression`) ? n.node.arguments?.[0] : null;
  if (sd(ee, r) || sd(l, r)) return !1;
  if (n.eventKey !== null && u !== null && n.eventKey !== u) {
    if (!j(n.node, `CallExpression`)) return !1;
    let e = Fu(n.node.arguments?.[0], r),
      t = Fu(a.arguments?.[0], r);
    if ((e !== null || t !== null) && e !== t) return !1;
    let i = od(ee, r),
      c = od(l, r);
    if ((i === null) != (c === null)) return !1;
    let u = pd(n.node.arguments?.[0], r),
      d = pd(a.arguments?.[0], r);
    if (u === null || u !== d) return !1;
    if (i && c) {
      let e = bd(n.node.arguments?.[1], r),
        t = bd(a.arguments?.[1], r);
      if (
        n.registrationVerbName !== `addEventListener` ||
        s !== `removeEventListener`
      )
        return !1;
      let i = P(n.node.callee);
      if (
        !j(i, `MemberExpression`) ||
        !yd(i.object, r) ||
        !yd(o.object, r) ||
        e === null ||
        e !== t ||
        !zu(n.node.arguments?.[2], a.arguments?.[2], r) ||
        !Cd(a, c, r)
      )
        return !1;
    }
  }
  if (s === `on`) {
    let e = a.arguments?.[1];
    return j(e, `Literal`) && e.value === null;
  }
  if (s === `removeEventListener` || s === `removeListener` || s === `off`) {
    let e = j(n.node, `CallExpression`) && Pf(n.node, a),
      t = e ? a.arguments?.[0] : a.arguments?.[1];
    if (!t) return s === `off`;
    let i = e ? (n.handlerKey ?? n.eventKey) : n.handlerKey,
      o = j(n.node, `CallExpression`) ? n.node.arguments?.[+!e] : null;
    return (
      (i !== null && Iu(t, r) === i) || (o !== null && Od(t, r) === Od(o, r))
    );
  }
  return s === `unobserve` && n.eventKey !== null ? u === n.eventKey : !0;
};
```

## cp

Bundle UTF-16 offsets 378244-380125; original line 1.

```javascript
const cp = E({
  id: `effect-needs-cleanup`,
  title: `Effect subscription or timer never cleaned up`,
  severity: `error`,
  tags: [`test-noise`],
  recommendation:
    "Return a cleanup function that stops the subscription or timer: `return () => target.removeEventListener(name, handler)` for listeners, `return () => clearInterval(id)` or `clearTimeout(id)` for timers, `return () => observer.disconnect()` for observers, `return () => socket.close()` for connections, or `return unsubscribe` if the subscribe call already gave you one.",
  create: (e) => {
    let t = (t) => {
      let n = np(t, e);
      if (!n && !Rf(t, e)) return;
      let r = Ope(t, e),
        i = r.length > 0,
        a = bpe(
          t,
          e,
          n
            ? {
                allowReturnedResourceEscape: n.doesEffectOwnEveryResult,
                allowReturnedTimerEscape: !1,
                includeOneShotTimers: !0,
                isEffectInvoked: !0,
                requireCallableReturnedResource: !0,
              }
            : i
              ? {
                  allowReturnedTimerEscape: !1,
                  includeOneShotTimers: !0,
                  isEffectInvoked: !0,
                }
              : void 0,
        );
      if (
        !a ||
        (i &&
          a.resourceName === `setTimeout` &&
          (!W(a.node, e) ||
            (F(t) &&
              t.params.length > 0 &&
              !e.cfg.isUnconditionalFromEntry(a.node) &&
              r.every((n) => Dpe(t, a.node, n, e)))))
      )
        return;
      let o = ju[a.kind];
      e.report({
        node: a.node,
        message: `\`${a.resourceName}\` creates a ${o} in a function that outlives the render, with no cleanup path. Store the handle and release it, or move this into a useEffect that returns cleanup, so it does not leak after unmount.`,
      });
    };
    return {
      CallExpression(n) {
        if (nr(n, `useCallback`, e.scopes)) {
          let r = Qn(n);
          r && !ap(r, e) && t(r);
          return;
        }
        if (!Mu(n, e)) return;
        let r = Qn(n);
        if (!r) return;
        let i = Qde(r, Zde(r, e), e);
        if (i.length === 0) return;
        let a = Bfe(r, i, e);
        if (!a) return;
        let o = ju[a.kind],
          s = Zn(n) ?? `effect`;
        e.report({
          node: n,
          message: `\`${a.resourceName}\` creates a ${o} in ${s} without guaranteed cleanup. Return a cleanup function that owns every allocation so it does not leak after unmount.`,
        });
      },
      FunctionDeclaration(e) {
        rp(e) && t(e);
      },
      ArrowFunctionExpression(n) {
        (rp(n) || ap(n, e) || Qf(n, e)) && t(n);
      },
      FunctionExpression(n) {
        (rp(n) || ap(n, e) || Qf(n, e)) && t(n);
      },
    };
  },
});
```

## uXe

Bundle UTF-16 offsets 1197197-1197437; original line 20.

```javascript
const uXe = (e) => {
  let t = P(e);
  return j(t, `ObjectExpression`)
    ? `object`
    : j(t, `ArrayExpression`)
      ? `array`
      : j(t, `ArrowFunctionExpression`) || j(t, `FunctionExpression`)
        ? `function`
        : j(t, `JSXElement`) || j(t, `JSXFragment`)
          ? `JSX`
          : j(t, `NewExpression`)
            ? `instance`
            : null;
};
```

## dXe

Bundle UTF-16 offsets 1197438-1197800; original line 20.

```javascript
const dXe = (e) => {
  let t = uXe(e);
  if (t) return { kind: t, viaBindingName: null };
  let n = P(e);
  if (!j(n, `Identifier`)) return null;
  let r = M(n, n.name);
  if (!r || !r.initializer || r.scopeOwner.type === `Program`) return null;
  let i = r.bindingIdentifier.parent;
  if (!i || !j(i, `VariableDeclarator`) || i.init !== r.initializer)
    return null;
  let a = uXe(r.initializer);
  return a ? { kind: a, viaBindingName: n.name } : null;
};
```

## fXe

Bundle UTF-16 offsets 1197801-1198833; original line 20.

```javascript
const fXe = E({
  id: `no-effect-with-fresh-deps`,
  title: `Effect dependency recreated every render`,
  severity: `error`,
  category: `State & Effects`,
  disabledWhen: [`react-compiler`],
  recommendation: `Move the value inside the hook body and depend on its simple inputs instead, or wrap it in useMemo / useCallback so it stays the same between renders.`,
  create: (e) => ({
    CallExpression(t) {
      if (!nr(t, tn, e.scopes)) return;
      let n = t.arguments ?? [];
      if (n.length < 2) return;
      let r = n[1];
      if (!r) return;
      let i = P(r);
      if (!j(i, `ArrayExpression`)) return;
      let a = t.callee,
        o;
      o = j(a, `Identifier`)
        ? a.name
        : j(a, `MemberExpression`) && j(a.property, `Identifier`)
          ? a.property.name
          : `hook`;
      let s = i.elements ?? [];
      for (let t of s) {
        if (!t || j(t, `SpreadElement`)) continue;
        let n = dXe(t);
        if (!n) continue;
        let r = n.viaBindingName
          ? `Your ${o} runs every render because dep \`${n.viaBindingName}\` is a new ${n.kind} built fresh each time, so \`===\` always fails.`
          : `Your ${o} runs every render because its deps include a new ${n.kind} built fresh each time, so \`===\` always fails.`;
        e.report({ node: t, message: r });
      }
    },
  }),
});
```
