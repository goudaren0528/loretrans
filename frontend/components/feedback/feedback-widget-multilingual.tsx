'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  Heart,
  Zap,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug' | 'compliment'
  rating?: number
  message: string
  category?: string
  email?: string
  metadata?: Record<string, any>
}

interface FeedbackWidgetProps {
  context?: string // 反馈上下文，如 'translation', 'pricing', 'onboarding'
  trigger?: React.ReactNode
}

export function FeedbackWidget({ context = 'general', trigger }: FeedbackWidgetProps) {
  const { user } = useAuth()
  const t = useTranslations('Feedback')
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('rating')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (type: FeedbackData['type']) => {
    if (!message.trim() && type !== 'rating') {
      toast({
        title: t('common.fill_required'),
        description: t('common.feedback_important'),
        variant: 'destructive'
      })
      return
    }

    if (type === 'rating' && rating === 0) {
      toast({
        title: t('rating.select'),
        description: t('rating.title'),
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData: FeedbackData = {
        type,
        rating: type === 'rating' ? rating : undefined,
        message: message.trim(),
        category,
        email: email.trim(),
        metadata: {
          context,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          url: window.location.href
        }
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      setSubmitted(true)
      toast({
        title: t('common.success'),
        description: t('common.success_desc'),
      })

      // 重置表单
      setTimeout(() => {
        setRating(0)
        setMessage('')
        setCategory('')
        setSubmitted(false)
        setIsOpen(false)
      }, 2000)

    } catch (error) {
      toast({
        title: t('common.submit_failed'),
        description: t('common.try_again'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number
    onChange?: (rating: number) => void
    readonly?: boolean 
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`p-1 transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoverRating || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  const suggestionCategories = [
    { value: 'feature', label: t('suggestion.categories.feature') },
    { value: 'ui', label: t('suggestion.categories.ui') },
    { value: 'performance', label: t('suggestion.categories.performance') },
    { value: 'language', label: t('suggestion.categories.language') },
    { value: 'other', label: t('suggestion.categories.other') }
  ]

  const bugCategories = [
    { value: 'translation', label: t('bug.categories.translation') },
    { value: 'ui', label: t('bug.categories.ui') },
    { value: 'payment', label: t('bug.categories.payment') },
    { value: 'account', label: t('bug.categories.account') },
    { value: 'other', label: t('bug.categories.other') }
  ]

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('feedback')}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('common.success')}
            </h3>
            <p className="text-gray-600">
              {t('common.success_desc')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t('feedback')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              {t('rating.tab')}
            </TabsTrigger>
            <TabsTrigger value="suggestion" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {t('suggestion.tab')}
            </TabsTrigger>
            <TabsTrigger value="bug" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              {t('bug.tab')}
            </TabsTrigger>
            <TabsTrigger value="compliment" className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              {t('compliment.tab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('rating.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <StarRating value={rating} onChange={setRating} />
                  <p className="text-sm text-gray-600 mt-2">
                    {rating === 0 && t('rating.select')}
                    {rating === 1 && t('rating.very_dissatisfied')}
                    {rating === 2 && t('rating.dissatisfied')}
                    {rating === 3 && t('rating.neutral')}
                    {rating === 4 && t('rating.satisfied')}
                    {rating === 5 && t('rating.very_satisfied')}
                  </p>
                </div>
                
                <Textarea
                  placeholder={t('rating.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />

                <Button 
                  onClick={() => handleSubmit('rating')} 
                  disabled={isSubmitting || rating === 0}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.submitting')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t('rating.submit')}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('suggestion.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('suggestion.type')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestionCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          category === cat.value
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder={t('suggestion.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />

                <Button 
                  onClick={() => handleSubmit('suggestion')} 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.submitting')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      {t('suggestion.submit')}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('bug.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('bug.type')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {bugCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          category === cat.value
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder={t('bug.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />

                {!user && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('bug.email')}
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <Button 
                  onClick={() => handleSubmit('bug')} 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.submitting')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      {t('bug.submit')}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('compliment.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t('compliment.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />

                <Button 
                  onClick={() => handleSubmit('compliment')} 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.submitting')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      {t('compliment.submit')}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// 快速反馈按钮组件
export function QuickFeedback({ translationId, rating }: { 
  translationId?: string
  rating?: 'good' | 'bad' 
}) {
  const [submitted, setSubmitted] = useState(false)
  const t = useTranslations('Feedback')

  const handleQuickFeedback = async (type: 'good' | 'bad') => {
    try {
      await fetch('/api/feedback/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translationId,
          rating: type,
          timestamp: new Date().toISOString()
        })
      })
      
      setSubmitted(true)
      toast({
        title: t('common.thanks_feedback'),
        description: t('common.feedback_helps'),
      })
    } catch (error) {
      console.error('Quick feedback error:', error)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>{t('common.thanks_feedback')}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{t('common.translation_quality')}</span>
      <button
        onClick={() => handleQuickFeedback('good')}
        className="p-1 rounded hover:bg-green-50 transition-colors"
        title={t('common.good_translation')}
      >
        <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-600" />
      </button>
      <button
        onClick={() => handleQuickFeedback('bad')}
        className="p-1 rounded hover:bg-red-50 transition-colors"
        title={t('common.bad_translation')}
      >
        <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-600" />
      </button>
    </div>
  )
}

// 浮动反馈按钮
export function FloatingFeedback() {
  const t = useTranslations('Feedback')
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FeedbackWidget
        trigger={
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {t('feedback')}
          </Button>
        }
      />
    </div>
  )
}
