'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  Users, 
  ArrowRight, 
  Star, 
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react'
import { AVAILABLE_LANGUAGES, LANGUAGES_BY_REGION, APP_CONFIG } from '../../../config/app.config'
import type { Language } from '../../../config/app.config'

interface SupportedLanguagesGridProps {
  showComingSoon?: boolean
  maxLanguages?: number
  groupByRegion?: boolean
  showStats?: boolean
}

export function SupportedLanguagesGrid({ 
  showComingSoon = true, 
  maxLanguages,
  groupByRegion = true,
  showStats = true 
}: SupportedLanguagesGridProps) {
  const t = useTranslations('HomePage')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')

  // 获取可用语言
  const availableLanguages = AVAILABLE_LANGUAGES
  const comingSoonLanguages = APP_CONFIG.languages.supported.filter(lang => !lang.available)

  // 按优先级排序
  const sortedLanguages = [...availableLanguages].sort((a, b) => {
    const priorityA = a.priority || 999
    const priorityB = b.priority || 999
    return priorityA - priorityB
  })

  // 限制显示数量
  const displayLanguages = maxLanguages 
    ? sortedLanguages.slice(0, maxLanguages)
    : sortedLanguages

  // 获取地区列表
  const regions = Object.keys(LANGUAGES_BY_REGION).filter(region => 
    LANGUAGES_BY_REGION[region as keyof typeof LANGUAGES_BY_REGION].some(lang => lang.available)
  )

  const getLanguageCard = (language: Language, isComingSoon = false) => (
    <Card key={language.code} className={`group transition-all duration-200 hover:shadow-lg ${
      isComingSoon ? 'opacity-60 border-dashed' : 'hover:scale-105'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{language.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-gray-600">
                {language.nativeName}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {language.priority === 1 && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Star className="w-3 h-3 mr-1" />
                核心
              </Badge>
            )}
            {isComingSoon && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                即将支持
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 语言统计信息 */}
          {showStats && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{language.speakers || 'N/A'} 使用者</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{language.region || 'Global'}</span>
              </div>
            </div>
          )}

          {/* 支持的翻译方向 */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {language.name} → English
            </Badge>
            {language.bidirectional && (
              <Badge variant="secondary" className="text-xs">
                English → {language.name}
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="pt-2">
            {isComingSoon ? (
              <Button variant="outline" disabled className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                即将推出
              </Button>
            ) : (
              <Link href={`/${language.slug}-to-english`}>
                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                  开始翻译
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!groupByRegion) {
    return (
      <div className="space-y-8">
        {/* 统计概览 */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {availableLanguages.length}
                </div>
                <div className="text-sm text-gray-600">支持的语言</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {availableLanguages.filter(lang => lang.bidirectional).length}
                </div>
                <div className="text-sm text-gray-600">双向翻译</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {regions.length}
                </div>
                <div className="text-sm text-gray-600">覆盖地区</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 语言网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLanguages.map(language => getLanguageCard(language))}
          {showComingSoon && comingSoonLanguages.map(language => 
            getLanguageCard(language, true)
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 统计概览 */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {availableLanguages.length}
              </div>
              <div className="text-xs text-gray-600">支持语言</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {availableLanguages.filter(lang => lang.bidirectional).length}
              </div>
              <div className="text-xs text-gray-600">双向翻译</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {regions.length}
              </div>
              <div className="text-xs text-gray-600">覆盖地区</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {comingSoonLanguages.length}
              </div>
              <div className="text-xs text-gray-600">即将支持</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 按地区分组显示 */}
      <Tabs value={selectedRegion} onValueChange={setSelectedRegion} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="priority">核心语言</TabsTrigger>
          <TabsTrigger value="africa">非洲</TabsTrigger>
          <TabsTrigger value="asia">亚洲</TabsTrigger>
          <TabsTrigger value="coming-soon">即将支持</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLanguages.map(language => getLanguageCard(language))}
          </div>
        </TabsContent>

        <TabsContent value="priority" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLanguages
              .filter(lang => lang.priority === 1)
              .map(language => getLanguageCard(language))
            }
          </div>
        </TabsContent>

        <TabsContent value="africa" className="mt-6">
          <div className="space-y-8">
            {['East Africa', 'West Africa', 'Southern Africa'].map(region => {
              const regionLanguages = LANGUAGES_BY_REGION[region as keyof typeof LANGUAGES_BY_REGION]
                ?.filter(lang => lang.available) || []
              
              if (regionLanguages.length === 0) return null

              return (
                <div key={region}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {region}
                    <Badge variant="outline">{regionLanguages.length} 语言</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regionLanguages.map(language => getLanguageCard(language))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="asia" className="mt-6">
          <div className="space-y-8">
            {['Southeast Asia', 'South Asia', 'Central Asia', 'East Asia'].map(region => {
              const regionLanguages = LANGUAGES_BY_REGION[region as keyof typeof LANGUAGES_BY_REGION]
                ?.filter(lang => lang.available) || []
              
              if (regionLanguages.length === 0) return null

              return (
                <div key={region}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {region}
                    <Badge variant="outline">{regionLanguages.length} 语言</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regionLanguages.map(language => getLanguageCard(language))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="coming-soon" className="mt-6">
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">更多语言即将推出</h3>
              <p className="text-gray-600 mb-4">
                我们正在努力添加更多小语种支持，让更多用户受益于专业翻译服务
              </p>
            </div>
            
            {comingSoonLanguages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comingSoonLanguages.map(language => getLanguageCard(language, true))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
