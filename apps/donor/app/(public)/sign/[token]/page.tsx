import PageClient from "./page-client";

export default function Page(props: { params: Promise<{ token: string }> }) {
  return <PageClient {...props} />;
}
