"use client";

import { PUBLIC_PAGE_TYPES } from "@asym/api/cms/public";

export default function Page() {
  return <main>{PUBLIC_PAGE_TYPES.page.key}</main>;
}
