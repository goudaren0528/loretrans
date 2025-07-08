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
        title: '请填写反馈内容',
        description: '您的反馈对我们很重要',
        variant: 'destructive'
      })
      return
    }

    if (type === 'rating' && rating === 0) {
      toast({
        title: '请选择评分',
        description: '请为我们的服务打分',
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
        title: '反馈提交成功',
        description: '感谢您的宝贵意见，我们会认真考虑！',
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
        title: '提交失败',
        description: '请稍后重试或联系客服',
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

  const categories = {
    suggestion: [
      { value: 'feature', label: '新功能建议' },
      { value: 'ui', label: '界面改进' },
      { value: 'performance', label: '性能优化' },
      { value: 'language', label: '语言支持' },
      { value: 'other', label: '其他建议' }
    ],
    bug: [
      { value: 'translation', label: '翻译问题' },
      { value: 'ui', label: '界面错误' },
      { value: 'payment', label: '支付问题' },
      { value: 'account', label: '账户问题' },
      { value: 'other', label: '其他错误' }
    ]
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              反馈
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              反馈提交成功！
            </h3>
            <p className="text-gray-600">
              感谢您的宝贵意见，我们会认真考虑并持续改进产品体验。
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
            反馈
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            您的反馈对我们很重要
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              评分
            </TabsTrigger>
            <TabsTrigger value="suggestion" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              建议
            </TabsTrigger>
            <TabsTrigger value="bug" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              问题
            </TabsTrigger>
            <TabsTrigger value="compliment" className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              表扬
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">为我们的服务打分</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <StarRating value={rating} onChange={setRating} />
                  <p className="text-sm text-gray-600 mt-2">
                    {rating === 0 && '请选择评分'}
                    {rating === 1 && '很不满意 😞'}
                    {rating === 2 && '不满意 😕'}
                    {rating === 3 && '一般 😐'}
                    {rating === 4 && '满意 😊'}
                    {rating === 5 && '非常满意 🤩'}
                  </p>
                </div>
                
                <Textarea
                  placeholder="请告诉我们您的具体感受和建议..."
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
                      提交中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      提交评分
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">功能建议</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    建议类型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.suggestion.map((cat) => (
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
                  placeholder="请详细描述您的建议，我们会认真考虑..."
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
                      提交中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      提交建议
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">问题报告</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    问题类型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.bug.map((cat) => (
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
                  placeholder="请详细描述遇到的问题，包括操作步骤和错误信息..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />

                {!user && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      联系邮箱（可选）
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
                      提交中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      报告问题
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">表扬和感谢</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="感谢您的认可！请告诉我们您最喜欢的功能或体验..."
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
                      提交中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      发送表扬
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
        title: '感谢您的反馈',
        description: '您的评价帮助我们改进翻译质量',
      })
    } catch (error) {
      console.error('Quick feedback error:', error)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>感谢反馈</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">翻译质量：</span>
      <button
        onClick={() => handleQuickFeedback('good')}
        className="p-1 rounded hover:bg-green-50 transition-colors"
        title="翻译质量好"
      >
        <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-600" />
      </button>
      <button
        onClick={() => handleQuickFeedback('bad')}
        className="p-1 rounded hover:bg-red-50 transition-colors"
        title="翻译质量差"
      >
        <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-600" />
      </button>
    </div>
  )
}

// 浮动反馈按钮
export function FloatingFeedback() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FeedbackWidget
        trigger={
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            反馈
          </Button>
        }
      />
    </div>
  )
}
