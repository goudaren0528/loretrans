'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    if (locale === newLocale) return;

    const currentPath = pathname;
    const pathSegments = currentPath.split('/');
    
    // Naive check if the first segment is a locale, needs improvement
    if (pathSegments.length > 1 && (pathSegments[1] === 'en' || pathSegments[1] === 'es' || pathSegments[1] === 'fr')) {
      pathSegments[1] = newLocale;
      router.replace(pathSegments.join('/'));
    } else {
      router.replace(`/${newLocale}${currentPath}`);
    }
  };

  return (
    <div>
      <Button variant="outline" size="icon" onClick={() => handleLocaleChange('en')} disabled={locale === 'en'}>EN</Button>
      <Button variant="outline" size="icon" onClick={() => handleLocaleChange('es')} disabled={locale === 'es'}>ES</Button>
      <Button variant="outline" size="icon" onClick={() => handleLocaleChange('fr')} disabled={locale === 'fr'}>FR</Button>
    </div>
  );
}
