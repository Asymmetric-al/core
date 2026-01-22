import { Navbar } from "@asym/ui/components/public/navbar";
import { Footer } from "@asym/ui/components/public/footer";
import { OrganizationJsonLd, WebsiteJsonLd } from "@asym/lib/seo";

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="container-responsive py-responsive-section">
          <h1 className="text-responsive-h1">Welcome to Asymmetric.al</h1>
          <p className="text-responsive-body mt-4">
            Supporting missionaries around the world.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
