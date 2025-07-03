'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Gift, 
  Zap, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Globe, 
  BookOpen,
  Users,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<OnboardingStepProps>
}

interface OnboardingStepProps {
  onNext: () => void
  onSkip: () => void
  onComplete: () => void
  currentStep: number
  totalSteps: number
}

// 用户场景选项
const USER_SCENARIOS = [
  {
    id: 'student',
    name: '学生用户',
    icon: BookOpen,
    description: '学术论文、作业翻译',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    benefits: ['学术文献翻译', '作业辅助', '研究资料处理']
  },
  {
    id: 'individual',
    name: '个人用户',
    icon: Users,
    description: '博客内容、日常沟通',
    color: 'bg-green-100 text-green-800 border-green-200',
    benefits: ['个人博客翻译', '社交媒体内容', '日常沟通']
  },
  {
    id: 'professional',
    name: '专业人士',
    icon: Building,
    description: '商务文档、客户沟通',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    benefits: ['商务文档翻译', '客户沟通', '专业资料']
  },
  {
    id: 'enterprise',
    name: '企业用户',
    icon: Globe,
    description: '大规模内容本地化',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    benefits: ['批量翻译', 'API访问', '团队管理', '优先支持']
  }
]

// 支持的语言
const LANGUAGES = [
  { code: 'ht', name: '海地克里奥尔语', flag: '🇭🇹', native: 'Kreyòl Ayisyen' },
  { code: 'lo', name: '老挝语', flag: '🇱🇦', native: 'ລາວ' },
  { code: 'sw', name: '斯瓦希里语', flag: '🇹🇿', native: 'Kiswahili' },
  { code: 'my', name: '缅甸语', flag: '🇲🇲', native: 'မြန်မာ' },
  { code: 'te', name: '泰卢固语', flag: '🇮🇳', native: 'తెలుగు' }
]

// 步骤1: 欢迎页面
function WelcomeStep({ onNext, onSkip, currentStep, totalSteps }: OnboardingStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-blue-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          欢迎使用 Transly! 🎉
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          我们专注于小语种翻译，让每种语言都能被理解
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Gift className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold text-green-800">新用户礼包</span>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">500积分</div>
        <div className="text-sm text-green-700">价值 $2，约可翻译 5万字符</div>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>500字符内免费</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>20+小语种支持</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>90%+准确率</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNext} size="lg" className="px-8">
          开始体验
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={onSkip} size="lg">
          跳过引导
        </Button>
      </div>
    </div>
  )
}

// 步骤2: 功能演示
function DemoStep({ onNext, onSkip, currentStep, totalSteps }: OnboardingStepProps) {
  const [demoText, setDemoText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const demoExamples = [
    { text: 'Bonjou, kijan ou ye?', translation: 'Hello, how are you?', lang: '海地克里奥尔语' },
    { text: 'ສະບາຍດີ, ເຈົ້າເປັນແນວໃດ?', translation: 'Hello, how are you?', lang: '老挝语' },
    { text: 'Hujambo, habari yako?', translation: 'Hello, how are you?', lang: '斯瓦希里语' }
  ]

  const handleDemo = async (example: typeof demoExamples[0]) => {
    setDemoText(example.text)
    setIsTranslating(true)
    
    // 模拟翻译过程
    setTimeout(() => {
      setTranslatedText(example.translation)
      setIsTranslating(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          体验小语种翻译魔力 ✨
        </h2>
        <p className="text-gray-600">
          点击下面的示例，看看我们如何处理Google翻译不支持的语言
        </p>
      </div>

      <div className="grid gap-4">
        {demoExamples.map((example, index) => (
          <button
            key={index}
            onClick={() => handleDemo(example)}
            className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{example.text}</div>
                <div className="text-sm text-gray-500">{example.lang}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {demoText && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">原文</div>
              <div className="p-3 bg-gray-50 rounded border text-gray-900">
                {demoText}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">翻译结果</div>
              <div className="p-3 bg-blue-50 rounded border text-gray-900 min-h-[52px] flex items-center">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>翻译中...</span>
                  </div>
                ) : (
                  translatedText
                )}
              </div>
            </div>
          </div>
          
          {translatedText && !isTranslating && (
            <div className="mt-4 text-center">
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                翻译完成！看到了吗？我们支持Google翻译不支持的语言！
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button onClick={onNext} size="lg" className="px-8">
          继续设置
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={onSkip} size="lg">
          跳过
        </Button>
      </div>
    </div>
  )
}

// 步骤3: 个性化设置
function PersonalizationStep({ onNext, onComplete, currentStep, totalSteps }: OnboardingStepProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    )
  }

  const handleComplete = async () => {
    // 保存用户偏好设置
    try {
      const preferences = {
        scenario: selectedScenario,
        favoriteLanguages: selectedLanguages,
        onboardingCompleted: true,
        completedAt: new Date().toISOString()
      }
      
      // 这里可以调用API保存用户偏好
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      
      onComplete()
    } catch (error) {
      console.error('Failed to save preferences:', error)
      onComplete() // 即使保存失败也继续
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          个性化您的翻译体验 🎯
        </h2>
        <p className="text-gray-600">
          告诉我们您的使用场景，我们会为您优化翻译体验
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">您主要用于什么场景？</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {USER_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon
            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedScenario === scenario.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      selectedScenario === scenario.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{scenario.name}</div>
                    <div className="text-sm text-gray-500">{scenario.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">您最常用的语言？（可多选）</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageToggle(language.code)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedLanguages.includes(language.code)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{language.name}</div>
                  <div className="text-sm text-gray-500">{language.native}</div>
                </div>
                {selectedLanguages.includes(language.code) && (
                  <Check className="w-5 h-5 text-green-600 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900 mb-1">个性化优化</div>
            <div className="text-sm text-blue-700">
              基于您的选择，我们会：
              <ul className="mt-2 space-y-1">
                <li>• 优先显示您常用的语言</li>
                <li>• 推荐适合的定价套餐</li>
                <li>• 提供相关的使用技巧</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button 
          onClick={handleComplete} 
          size="lg" 
          className="px-8"
          disabled={!selectedScenario}
        >
          完成设置
          <Check className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={onComplete} size="lg">
          稍后设置
        </Button>
      </div>
    </div>
  )
}

// 主要的引导组件
export function UserOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '欢迎',
      description: '欢迎使用Transly',
      component: WelcomeStep
    },
    {
      id: 'demo',
      title: '演示',
      description: '体验翻译功能',
      component: DemoStep
    },
    {
      id: 'personalization',
      title: '个性化',
      description: '设置偏好',
      component: PersonalizationStep
    }
  ]

  // 检查是否需要显示引导
  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted')
      const userPreferences = localStorage.getItem('userPreferences')
      
      if (!hasCompletedOnboarding && !userPreferences) {
        setIsOpen(true)
      }
    }
  }, [user])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
    localStorage.setItem('onboardingCompleted', 'true')
  }

  const handleComplete = () => {
    setIsOpen(false)
    localStorage.setItem('onboardingCompleted', 'true')
    
    // 可以跳转到特定页面或显示成功消息
    router.push('/text-translate')
  }

  if (!user || !isOpen) return null

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {steps[currentStep].title}
            </DialogTitle>
            <Badge variant="secondary">
              {currentStep + 1} / {steps.length}
            </Badge>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-2" />
        </DialogHeader>

        <div className="py-6">
          <CurrentStepComponent
            onNext={handleNext}
            onSkip={handleSkip}
            onComplete={handleComplete}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>

        {currentStep > 0 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            <div className="text-sm text-gray-500">
              步骤 {currentStep + 1} / {steps.length}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// 手动触发引导的按钮组件
export function OnboardingTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        新手引导
      </Button>
      
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <UserOnboarding />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
