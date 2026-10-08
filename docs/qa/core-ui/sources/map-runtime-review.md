# Map control and canvas review

The actual route's fixed navbar covered Back, Search and the count strip.
Exactly three app-owned wrapper offsets changed from `top-4` to `top-20`,
reserving Core's existing 80px public chrome space. The shared MapLibre source,
providers, data hooks, marker identities, selection, dialogs/sheets and routing
remain unchanged. [The structured supplement](./map-runtime-review.json)
records the exact source SHA and attribution.

At 390 and 1440px, native browser checks confirm Back/Search begin at 80/81px
below the navbar, their center hit tests reach the controls, and desktop counts
remain visible. Narrow counts retain their intentional hidden state. Keyboard
Enter opens actual Search, unmatched input shows the real empty list, Clear
retains an empty input, Escape restores trigger focus, and touch/click reopens.
Both document widths remain bounded. Before/after geometry and screenshots are
runtime-owned in the [before](../before-index.json) and [after](../after-index.json)
indexes.

Existing MapUI public-seam tests pass 4/4; donor typecheck passes 11/11 tasks,
native donor lint passes, and formatting passes. Direct raw lint retains the
same 15 pre-existing findings across this offset change, with no new finding
or suppression change. These focused results are separate from final root gates.

An earlier narrow canvas capture was blank, while the saved original narrow
image contained geography. Fresh original/current browser contexts mounted at
the target narrow viewport both render Carto geography; current wide does too.
The earlier transient blank capture's precise cause remains unresolved and is
not counted as an introduced source regression. The existing engine already
observes container resizing; no extra sizing or initialization workaround was
justified.

Productive selected-location records remain unavailable in the local datasource.
Actual native empty-search/focus behavior and rendered geography do not prove
productive location selection, tenant data or provider workflows.
