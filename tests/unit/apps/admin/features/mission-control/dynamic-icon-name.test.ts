import dynamicIconImports from "lucide-react/dynamicIconImports";
import { describe, expect, it } from "vitest";

import {
  pascalToKebab,
  resolveDynamicIconKebabName,
} from "../../../../../../apps/admin/features/mission-control/components/dynamic-icon-name";

describe("pascalToKebab", () => {
  it("converts Mission Control tile icon names to dynamic import keys", () => {
    expect(pascalToKebab("Globe")).toBe("globe");
    expect(pascalToKebab("LayoutDashboard")).toBe("layout-dashboard");
    expect(pascalToKebab("CheckCircle")).toBe("check-circle");
    expect(pascalToKebab("AlertTriangle")).toBe("alert-triangle");
    expect(pascalToKebab("BarChart3")).toBe("bar-chart-3");
    expect(pascalToKebab("CalendarDays")).toBe("calendar-days");
  });

  it("leaves kebab-case names unchanged", () => {
    expect(pascalToKebab("globe")).toBe("globe");
    expect(pascalToKebab("layout-dashboard")).toBe("layout-dashboard");
  });
});

describe("resolveDynamicIconKebabName", () => {
  const importKeys = dynamicIconImports as Record<string, unknown>;

  it("accepts PascalCase names used in mission-control tiles", () => {
    expect(resolveDynamicIconKebabName("Globe", importKeys)).toBe("globe");
    expect(resolveDynamicIconKebabName("UserPlus", importKeys)).toBe(
      "user-plus",
    );
    expect(resolveDynamicIconKebabName("PenSquare", importKeys)).toBe(
      "pen-square",
    );
  });

  it("accepts kebab-case keys directly", () => {
    expect(resolveDynamicIconKebabName("globe", importKeys)).toBe("globe");
  });

  it("returns null for unknown names", () => {
    expect(resolveDynamicIconKebabName("NotARealIcon", importKeys)).toBeNull();
  });

  it("returns null for removed brand icons (use brand-social seam instead)", () => {
    for (const brandIcon of [
      "Facebook",
      "Github",
      "Instagram",
      "Linkedin",
      "Twitter",
      "Youtube",
    ]) {
      expect(resolveDynamicIconKebabName(brandIcon, importKeys)).toBeNull();
    }
  });
});
