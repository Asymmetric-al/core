import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";

export function CareDirectoryLimitNote({
  shown,
  total,
}: {
  shown: number;
  total: number;
}) {
  if (total <= shown) return null;
  return (
    <Alert role="note" variant="info">
      <AlertTitle>
        Showing {shown} of {total} members
      </AlertTitle>
      <AlertDescription>
        Only the newest {shown} members are listed. Follow-up, crisis or at-risk
        and healthy counts, search and filters cover this listed group, not
        everyone.
      </AlertDescription>
    </Alert>
  );
}
