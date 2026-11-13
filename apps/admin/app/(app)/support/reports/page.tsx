import { redirect } from "next/navigation";
import { Suspense } from "react";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default function SupportReportsRoot(props: Props) {
  return (
    <Suspense fallback={<p role="status">Opening reports…</p>}>
      <ReportsRedirect {...props} />
    </Suspense>
  );
}
async function ReportsRedirect({ searchParams }: Props): Promise<never> {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value))
      value.forEach((entry) => query.append(key, entry));
    else if (value !== undefined) query.set(key, value);
  }
  redirect(
    "/support/reports/overview" + (query.size ? "?" + query.toString() : ""),
  );
}
