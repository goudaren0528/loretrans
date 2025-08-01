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
import { LanguageSwitcher } from './i18n/language-switcher'
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
            <img src="/loretrans-logo.svg" alt="LoReTrans Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">LoReTrans</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = navIcons[item.key] || Home
            const href = buildLocalizedUrl(currentLocale || 'en', item.href)
            const isActive = pathname === href || 
              (item.href !== '/' && pathname.startsWith(href))

            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tNav(item.key)}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Credit Balance - only show for authenticated users */}
          <div className="hidden md:block">
            <CreditBalance />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="icon-only" />

          {/* User Menu */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Credit Balance */}
            <CreditBalance />

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = navIcons[item.key] || Home
                const href = buildLocalizedUrl(currentLocale || 'en', item.href)
                const isActive = pathname === href || 
                  (item.href !== '/' && pathname.startsWith(href))

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tNav(item.key)}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Language Switcher */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{tLayout('Footer.interface_language')}</span>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>

            {/* Mobile User Menu */}
            <div className="pt-4 border-t">
              <UserMenuMobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export function Footer() {
  const tLayout = useTranslations('Layout')
  const pathname = usePathname()
  const { locale: currentLocale } = detectLocaleFromPath(pathname)

  const footerLinks = [
    { key: 'about_us', href: '/about' },
    { key: 'pricing', href: '/pricing' },
    // Contact temporarily hidden
    // { key: 'contact_support', href: '/contact' },
    { key: 'privacy_policy', href: '/privacy' },
    { key: 'terms_of_service', href: '/terms' },
  ]

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/loretrans-logo.svg" alt="LoReTrans Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">LoReTrans</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tLayout('Footer.tagline')}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{tLayout('Footer.interface_language')}:</span>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{tLayout('Footer.company')}</h3>
            <div className="space-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.key}
                  href={buildLocalizedUrl(currentLocale || 'en', link.href)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tLayout(`Footer.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{tLayout('Footer.supported_languages')}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/creole-to-english')}
                className="hover:text-primary transition-colors"
              >
                Haitian Creole
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/lao-to-english')}
                className="hover:text-primary transition-colors"
              >
                Lao
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/swahili-to-english')}
                className="hover:text-primary transition-colors"
              >
                Swahili
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/burmese-to-english')}
                className="hover:text-primary transition-colors"
              >
                Burmese
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/telugu-to-english')}
                className="hover:text-primary transition-colors"
              >
                Telugu
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/sindhi-to-english')}
                className="hover:text-primary transition-colors"
              >
                Sindhi
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/bambara-to-english')}
                className="hover:text-primary transition-colors"
              >
                Bambara
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/wolof-to-english')}
                className="hover:text-primary transition-colors"
              >
                Wolof
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/yoruba-to-english')}
                className="hover:text-primary transition-colors"
              >
                Yoruba
              </Link>
              <Link 
                href={buildLocalizedUrl(currentLocale || 'en', '/igbo-to-english')}
                className="hover:text-primary transition-colors"
              >
                Igbo
              </Link>
            </div>
            <Link 
              href={buildLocalizedUrl(currentLocale || 'en', '/about#languages')}
              className="text-primary hover:underline text-sm"
            >
              {tLayout('Footer.view_all_languages')}
            </Link>
          </div>

          {/* Contact - Temporarily Hidden */}
          {/* 
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{tLayout('Footer.contact_us')}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>{tLayout('Footer.support_email')}</div>
              <div>{tLayout('Footer.support_24_7')}</div>
              <Link 
                href="/contact" 
                className="text-primary hover:underline"
              >
                {tLayout('Footer.contact_form')} →
              </Link>
            </div>
          </div>
          */}
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LoReTrans. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
