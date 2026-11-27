import { PayloadClipboardReset } from "@/src/cms-ui/web-studio/shell/payload-clipboard";

export default function WebStudioOrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PayloadClipboardReset />
      {children}
    </>
  );
}
