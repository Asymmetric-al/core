import HeroSection from '@/components/shadcn-studio/blocks/hero-section-09/hero-section-09'
import Header from '@/components/shadcn-studio/blocks/hero-section-09/header'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'

const navigationData: NavigationSection[] = [
  {
    title: 'Features',
    href: '#features'
  },
  {
    title: 'Pricing',
    href: '#pricing'
  },
  {
    title: 'About',
    href: '#about'
  },
  {
    title: 'Resources',
    items: [
      { title: 'Documentation', href: '#' },
      { title: 'API Reference', href: '#' },
      { title: 'Support', href: '#' }
    ]
  }
]

const HeroSectionPage = () => {
  return (
    <div className='relative'>
      <Header navigationData={navigationData} />
      <main className='flex flex-col overflow-hidden pt-16'>
        <HeroSection />
      </main>
    </div>
  )
}

export default HeroSectionPage
