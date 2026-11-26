import { SignInBackdrop } from "@asym/ui/components/auth/SignInBackdrop";

import narrowStill from "./sign-in-still-narrow.webp";
import wideStill from "./sign-in-still-wide.webp";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignInBackdrop stills={{ narrow: narrowStill.src, wide: wideStill.src }}>
      {children}
    </SignInBackdrop>
  );
}
