'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { GithubIcon, MenuIcon, SearchIcon, TwitterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import MenuDropdown from '@/components/shadcn-studio/blocks/menu-dropdown'
import MenuNavigation from '@/components/shadcn-studio/blocks/menu-navigation'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'

import { cn } from '@/lib/utils'

import Logo from '@/components/shadcn-studio/logo'

type HeaderProps = {
  navigationData: NavigationSection[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 h-16 w-full transition-all duration-300',
        {
          'bg-card/75 shadow-md backdrop-blur': isScrolled
        },
        className
      )}
    >
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
        <Link href='/'>
          <Logo className='gap-3' />
        </Link>

        <div className='flex items-center max-lg:gap-4'>
          <MenuNavigation navigationData={navigationData} className='max-lg:hidden' />

          <Separator orientation='vertical' className='bg-muted-foreground mx-3 h-6! max-lg:hidden' />

          <div className='flex items-center max-sm:hidden'>
            <Button variant='ghost' size='icon' asChild>
              <a href='#'>
                <SearchIcon className='size-5' />
              </a>
            </Button>
            <Button variant='ghost' size='icon' asChild>
              <a href='#'>
                <GithubIcon className='size-5' />
              </a>
            </Button>
            <Button variant='ghost' size='icon' asChild>
              <a href='#'>
                <TwitterIcon className='size-5' />
              </a>
            </Button>
          </div>

          <Button className='lg:ml-4' asChild>
            <Link href='/login'>Sign In</Link>
          </Button>

          <MenuDropdown
            align='end'
            navigationData={navigationData}
            trigger={
              <Button variant='outline' size='icon' className='lg:hidden'>
                <MenuIcon />
                <span className='sr-only'>Menu</span>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}

export default Header
