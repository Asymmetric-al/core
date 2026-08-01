import { describe, expect, it } from "vitest";

import {
  contentModerationUiReducer,
  INITIAL_CONTENT_MODERATION_UI_STATE,
} from "../../../../apps/admin/app/(app)/feed/feed-model";

describe("contentModerationUiReducer", () => {
  it("updates the active tab without mutating other fields", () => {
    const nextState = contentModerationUiReducer(
      INITIAL_CONTENT_MODERATION_UI_STATE,
      { type: "set_active_tab", value: "all" },
    );

    expect(nextState).toEqual({
      ...INITIAL_CONTENT_MODERATION_UI_STATE,
      activeTab: "all",
    });
  });

  it("updates search and filter state independently", () => {
    const withSearch = contentModerationUiReducer(
      INITIAL_CONTENT_MODERATION_UI_STATE,
      { type: "set_search_query", value: "missions" },
    );
    const withVisibility = contentModerationUiReducer(withSearch, {
      type: "set_filter_visibility",
      value: "partners",
    });
    const withType = contentModerationUiReducer(withVisibility, {
      type: "set_filter_type",
      value: "story",
    });
    const withSort = contentModerationUiReducer(withType, {
      type: "set_sort_by",
      value: "engagement",
    });

    expect(withSort.searchQuery).toBe("missions");
    expect(withSort.filterVisibility).toBe("partners");
    expect(withSort.filterType).toBe("story");
    expect(withSort.sortBy).toBe("engagement");
  });

  it("toggles refresh state", () => {
    const nextState = contentModerationUiReducer(
      INITIAL_CONTENT_MODERATION_UI_STATE,
      { type: "set_is_refreshing", value: true },
    );

    expect(nextState.isRefreshing).toBe(true);
    expect(INITIAL_CONTENT_MODERATION_UI_STATE.isRefreshing).toBe(false);
  });
});
