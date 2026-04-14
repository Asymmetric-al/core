import { formatAdminURL } from "payload/shared";

type BuildCreateUrlArgs = {
  apiRoute: string;
};

export function buildWebStudioCreateFromTemplateUrl({
  apiRoute,
}: BuildCreateUrlArgs) {
  return formatAdminURL({
    apiRoute,
    path: "/web-studio/create-from-template",
  });
}
