import { Navbar } from "@asym/ui/components/public/navbar";
import { Footer } from "@asym/ui/components/public/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
