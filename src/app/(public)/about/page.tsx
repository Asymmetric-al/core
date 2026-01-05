import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { 
  AboutHero, 
  AboutBelief, 
  AboutValues, 
  AboutLeadership, 
  AboutCTA 
} from '@/components/public/about-sections';

export const metadata: Metadata = pageMetadata.about;

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen selection:bg-emerald-500/30">
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]} 
      />
      <AboutHero />
      <AboutBelief />
      <AboutValues />
      <AboutLeadership />
      <AboutCTA />
    </div>
  );
}
