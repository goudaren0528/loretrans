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
            <Languages className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Transly</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = navIcons[item.key] || Home
            const href = buildLocalizedUrl(item.href, currentLocale)
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
                const href = buildLocalizedUrl(item.href, currentLocale)
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
                <span className="text-sm font-medium text-muted-foreground">界面语言</span>
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
    { key: 'about', href: '/about' },
    { key: 'pricing', href: '/pricing' },
    { key: 'contact', href: '/contact' },
    { key: 'privacy', href: '/privacy' },
    { key: 'terms', href: '/terms' },
  ]

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">Transly</span>
            </div>
            <p className="text-sm text-muted-foreground">
              专业小语种AI翻译服务，让每种语言都能被理解。
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">界面语言:</span>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">快速链接</h3>
            <div className="space-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.key}
                  href={buildLocalizedUrl(link.href, currentLocale)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tLayout(`footer.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">支持的语言</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>海地克里奥尔语</div>
              <div>老挝语</div>
              <div>斯瓦希里语</div>
              <div>缅甸语</div>
              <div>泰卢固语</div>
              <Link 
                href="/about#languages" 
                className="text-primary hover:underline"
              >
                查看全部 →
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">联系我们</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>support@transly.app</div>
              <div>24/7 在线支持</div>
              <Link 
                href="/contact" 
                className="text-primary hover:underline"
              >
                联系表单 →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Transly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
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