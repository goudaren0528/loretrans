'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check, Globe } from 'lucide-react';
import { useMemo, useState } from 'react';
import { switchLocale, detectLocaleFromPath, type Locale } from '@/lib/navigation';

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);
  
  const { locale: currentLocale } = detectLocaleFromPath(pathname);

  const handleLocaleChange = (newLocale: Locale) => {
    if (isChanging || !currentLocale) return;
    setIsChanging(true);
    try {
      const newPath = switchLocale(pathname, currentLocale, newLocale);
      router.push(newPath);
    } catch (error) {
      console.error('Error changing locale:', error);
      setIsChanging(false);
    }
  };

  const currentLocaleInfo = locales.find(l => l.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 px-3 gap-2"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-flex">
            {currentLocaleInfo?.name || 'Language'}
          </span>
          <span className="sm:hidden">
            {currentLocaleInfo?.flag || '🌐'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map(({ code, name, flag }) => (
          <DropdownMenuItem
            key={code}
            disabled={isChanging}
            onClick={() => handleLocaleChange(code as Locale)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{flag}</span>
              <span>{name}</span>
            </div>
            {currentLocale === code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
