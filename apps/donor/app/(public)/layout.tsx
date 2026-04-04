import { Footer } from "@asym/ui/components/public/footer";
import { Navbar } from "@asym/ui/components/public/navbar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <RouteMainViewTransitionBoundary>
        {children}
      </RouteMainViewTransitionBoundary>
      <Footer />
    </>
  );
}
