'use client'

import React, { ComponentProps, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import {
  Languages,
  Menu,
  X,
  Home,
  Info,
  Contact,
  DollarSign,
} from 'lucide-react'
import LocaleSwitcher from './LocaleSwitcher'
import { UserMenu, UserMenuMobile } from './auth/user-menu'
import { CreditBalance } from './credits/credit-balance'
import {
  navigationItems,
  buildLocalizedUrl,
  detectLocaleFromPath,
  type Locale
} from '@/lib/navigation';
import { useTranslations } from 'next-intl';

type NavLink = ComponentProps<typeof Link>['href']

// Add icons to navigationItems in navigation.ts or define them here
const navIcons: { [key: string]: React.ElementType } = {
  home: Home,
  about: Info,
  pricing: DollarSign,
  contact: Contact,
};

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const tNav = useTranslations('Navigation')
  const tLayout = useTranslations('Layout')

  const { locale: currentLocale } = detectLocaleFromPath(pathname)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-primary p-2">
              <Languages className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Transly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = navIcons[item.key]
              const localeAwareHref = buildLocalizedUrl(
                currentLocale || 'en',
                item.href as string
              )
              const isActive = pathname === localeAwareHref
              return (
                <Link key={item.href.toString()} href={localeAwareHref}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'flex items-center space-x-2',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{tNav(item.translationKey.replace('Navigation.', ''))}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <LocaleSwitcher />
          
          {/* Credit Balance (Desktop) */}
          <div className="hidden md:flex">
            <CreditBalance size="sm" />
          </div>
          
          {/* Desktop Auth */}
          <div className="hidden md:flex">
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:hidden">
            <div className="space-y-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = navIcons[item.key]
                  const localeAwareHref = buildLocalizedUrl(
                    currentLocale || 'en',
                    item.href as string
                  )
                  const isActive = pathname === localeAwareHref
                  return (
                    <Link
                      key={item.href.toString()}
                      href={localeAwareHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{tNav(item.translationKey.replace('Navigation.', ''))}</span>
                    </Link>
                  )
                })}
              </div>
              
              {/* Mobile Credit Balance */}
              <div className="px-4 py-2 border-t">
                <CreditBalance size="sm" />
              </div>
              
              {/* Mobile Auth */}
              <div className="border-t pt-4">
                <UserMenuMobile />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Footer() {
  const tLayout = useTranslations('Layout')
  
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-primary p-2">
                <Languages className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Transly</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered translation for low-resource languages.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/text-translate"
                  className="hover:text-foreground transition-colors"
                >
                  Text Translation
                </Link>
              </li>
              <li>
                <Link
                  href="/document-translate"
                  className="hover:text-foreground transition-colors"
                >
                  Document Translation
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  Supported Languages
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/compliance"
                  className="hover:text-foreground transition-colors"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={{ pathname: '/about', hash: 'faq' }}
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  {tLayout('Footer.contact_support')}
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="hover:text-foreground transition-colors"
                >
                  API Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Transly. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
} 