'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Languages, FileText, Info, Menu, X } from 'lucide-react'
import { useState } from 'react'
import LocaleSwitcher from './LocaleSwitcher'
import { useTranslations } from 'next-intl'

export function Navigation() {
  const t = useTranslations('Layout.Navigation')
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/',
      label: t('text_translation'),
      icon: Languages,
      description: t('text_translation_desc')
    },
    {
      href: '/document-translate',
      label: t('document_translation'),
      icon: FileText,
      description: t('document_translation_desc')
    },
    {
      href: '/about',
      label: t('about'),
      icon: Info,
      description: t('about_desc')
    }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-primary p-2">
              <Languages className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Transly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
            <div className="ml-4">
              <LocaleSwitcher />
            </div>
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
          <div className="md:hidden border-t py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-muted",
                      isActive && "bg-primary/10 text-primary"
                    )}>
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Footer() {
  const t = useTranslations('Layout.Footer')
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
              {t('tagline')}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {t('text_translation')}
                </Link>
              </li>
              <li>
                <Link href="/document-translate" className="hover:text-foreground transition-colors">
                  {t('document_translation')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  {t('supported_languages')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  {t('about_us')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t('privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t('terms_of_service')}
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-foreground transition-colors">
                  {t('compliance')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('resources')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about#faq" className="hover:text-foreground transition-colors">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  {t('contact_support')}
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-foreground transition-colors">
                  {t('api_docs')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('copyright')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('powered_by')}
          </p>
        </div>
      </div>
    </footer>
  )
} 