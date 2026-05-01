import PageClient from "./page-client";
import { supportHubDemoModel } from "./support-hub.data";

export default function Page() {
  return <PageClient model={supportHubDemoModel} />;
}
