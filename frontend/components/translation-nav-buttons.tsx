import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FileText, Type, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TranslationNavButtonsProps {
  currentPage: 'text' | 'document';
  locale: string;
}

export function TranslationNavButtons({ currentPage, locale }: TranslationNavButtonsProps) {
  const t = useTranslations('Layout.Navigation');
  
  if (currentPage === 'text') {
    // 在文本翻译页面显示跳转到文档翻译的按钮
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('document_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('document_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={`/${locale}/document-translate`}>
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 min-w-[160px]"
            >
              <span>{t('document_translation')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  } else {
    // 在文档翻译页面显示跳转到文本翻译的按钮
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <Type className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('text_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('text_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={`/${locale}/text-translate`}>
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-900/30 border-green-200 dark:border-green-700 min-w-[160px]"
            >
              <span>{t('text_translation')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}