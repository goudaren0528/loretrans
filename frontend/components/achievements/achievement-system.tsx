'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Zap, 
  Globe, 
  Users, 
  Gift, 
  Crown, 
  Medal,
  Target,
  Flame,
  Heart,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle,
  Lock
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'

// 成就类型定义
interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'translation' | 'social' | 'milestone' | 'special'
  type: 'progress' | 'milestone' | 'streak'
  requirement: {
    target: number
    metric: string // 'translations', 'characters', 'days', 'languages', etc.
  }
  reward: {
    credits: number
    badge?: string
    title?: string
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  hidden?: boolean // 隐藏成就，完成后才显示
}

// 用户成就进度
interface UserAchievement {
  achievementId: string
  progress: number
  completed: boolean
  completedAt?: string
  claimed: boolean
  claimedAt?: string
}

// 成就定义
const ACHIEVEMENTS: Achievement[] = [
  // 翻译类成就
  {
    id: 'first_translation',
    name: '初次翻译',
    description: '完成您的第一次翻译',
    icon: Zap,
    category: 'translation',
    type: 'milestone',
    requirement: { target: 1, metric: 'translations' },
    reward: { credits: 50 },
    rarity: 'common'
  },
  {
    id: 'translation_novice',
    name: '翻译新手',
    description: '完成10次翻译',
    icon: BookOpen,
    category: 'translation',
    type: 'progress',
    requirement: { target: 10, metric: 'translations' },
    reward: { credits: 100, badge: 'novice' },
    rarity: 'common'
  },
  {
    id: 'translation_expert',
    name: '翻译专家',
    description: '完成100次翻译',
    icon: Trophy,
    category: 'translation',
    type: 'progress',
    requirement: { target: 100, metric: 'translations' },
    reward: { credits: 500, badge: 'expert', title: '翻译专家' },
    rarity: 'rare'
  },
  {
    id: 'translation_master',
    name: '翻译大师',
    description: '完成1000次翻译',
    icon: Crown,
    category: 'translation',
    type: 'progress',
    requirement: { target: 1000, metric: 'translations' },
    reward: { credits: 2000, badge: 'master', title: '翻译大师' },
    rarity: 'epic'
  },
  {
    id: 'character_milestone_10k',
    name: '字符里程碑',
    description: '翻译超过10,000个字符',
    icon: Target,
    category: 'translation',
    type: 'progress',
    requirement: { target: 10000, metric: 'characters' },
    reward: { credits: 200 },
    rarity: 'common'
  },
  {
    id: 'character_milestone_100k',
    name: '字符大师',
    description: '翻译超过100,000个字符',
    icon: Medal,
    category: 'translation',
    type: 'progress',
    requirement: { target: 100000, metric: 'characters' },
    reward: { credits: 1000, badge: 'character_master' },
    rarity: 'rare'
  },
  
  // 语言类成就
  {
    id: 'polyglot_beginner',
    name: '多语言初学者',
    description: '尝试翻译3种不同的语言',
    icon: Globe,
    category: 'translation',
    type: 'progress',
    requirement: { target: 3, metric: 'languages' },
    reward: { credits: 150 },
    rarity: 'common'
  },
  {
    id: 'polyglot_expert',
    name: '多语言专家',
    description: '尝试翻译所有支持的语言',
    icon: Globe,
    category: 'translation',
    type: 'progress',
    requirement: { target: 6, metric: 'languages' }, // 假设支持6种语言
    reward: { credits: 800, badge: 'polyglot', title: '多语言专家' },
    rarity: 'epic'
  },

  // 连续使用类成就
  {
    id: 'daily_streak_3',
    name: '三日连击',
    description: '连续3天使用翻译服务',
    icon: Flame,
    category: 'milestone',
    type: 'streak',
    requirement: { target: 3, metric: 'daily_streak' },
    reward: { credits: 100 },
    rarity: 'common'
  },
  {
    id: 'daily_streak_7',
    name: '一周坚持',
    description: '连续7天使用翻译服务',
    icon: Flame,
    category: 'milestone',
    type: 'streak',
    requirement: { target: 7, metric: 'daily_streak' },
    reward: { credits: 300, badge: 'persistent' },
    rarity: 'rare'
  },
  {
    id: 'daily_streak_30',
    name: '月度坚持',
    description: '连续30天使用翻译服务',
    icon: Flame,
    category: 'milestone',
    type: 'streak',
    requirement: { target: 30, metric: 'daily_streak' },
    reward: { credits: 1500, badge: 'dedicated', title: '坚持不懈' },
    rarity: 'legendary'
  },

  // 社交类成就
  {
    id: 'first_feedback',
    name: '反馈达人',
    description: '提交您的第一个反馈',
    icon: Heart,
    category: 'social',
    type: 'milestone',
    requirement: { target: 1, metric: 'feedback' },
    reward: { credits: 50 },
    rarity: 'common'
  },
  {
    id: 'referral_success',
    name: '推荐达人',
    description: '成功推荐3位朋友注册',
    icon: Users,
    category: 'social',
    type: 'progress',
    requirement: { target: 3, metric: 'referrals' },
    reward: { credits: 500, badge: 'referrer' },
    rarity: 'rare'
  },

  // 特殊成就
  {
    id: 'early_adopter',
    name: '早期用户',
    description: '成为前1000名注册用户',
    icon: Star,
    category: 'special',
    type: 'milestone',
    requirement: { target: 1000, metric: 'user_rank' },
    reward: { credits: 1000, badge: 'early_adopter', title: '早期用户' },
    rarity: 'legendary',
    hidden: true
  },
  {
    id: 'perfect_rating',
    name: '完美体验',
    description: '给出5星评价',
    icon: Star,
    category: 'social',
    type: 'milestone',
    requirement: { target: 1, metric: 'five_star_rating' },
    reward: { credits: 100 },
    rarity: 'common'
  }
]

// 成就系统组件
export function AchievementSystem() {
  const { user } = useAuth()
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [userStats, setUserStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadUserAchievements()
      loadUserStats()
    }
  }, [user])

  const loadUserAchievements = async () => {
    try {
      const response = await fetch('/api/achievements/user')
      if (response.ok) {
        const data = await response.json()
        setUserAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats || {})
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (achievementId: string) => {
    try {
      const response = await fetch('/api/achievements/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: '奖励已领取！',
          description: `获得 ${data.reward.credits} 积分奖励`,
        })
        
        // 更新本地状态
        setUserAchievements(prev => 
          prev.map(ua => 
            ua.achievementId === achievementId 
              ? { ...ua, claimed: true, claimedAt: new Date().toISOString() }
              : ua
          )
        )
      }
    } catch (error) {
      toast({
        title: '领取失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const getAchievementProgress = (achievement: Achievement): UserAchievement | null => {
    return userAchievements.find(ua => ua.achievementId === achievement.id) || null
  }

  const calculateProgress = (achievement: Achievement): number => {
    const userAchievement = getAchievementProgress(achievement)
    if (userAchievement) {
      return userAchievement.progress
    }

    // 基于用户统计计算进度
    const metric = achievement.requirement.metric
    const currentValue = userStats[metric] || 0
    return Math.min(currentValue, achievement.requirement.target)
  }

  const isAchievementCompleted = (achievement: Achievement): boolean => {
    const userAchievement = getAchievementProgress(achievement)
    return userAchievement?.completed || false
  }

  const isAchievementClaimed = (achievement: Achievement): boolean => {
    const userAchievement = getAchievementProgress(achievement)
    return userAchievement?.claimed || false
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300'
      case 'rare': return 'text-blue-600 border-blue-300'
      case 'epic': return 'text-purple-600 border-purple-300'
      case 'legendary': return 'text-yellow-600 border-yellow-300'
      default: return 'text-gray-600 border-gray-300'
    }
  }

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-50'
      case 'rare': return 'bg-blue-50'
      case 'epic': return 'bg-purple-50'
      case 'legendary': return 'bg-yellow-50'
      default: return 'bg-gray-50'
    }
  }

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    if (selectedCategory === 'all') return true
    return achievement.category === selectedCategory
  }).filter(achievement => {
    // 隐藏未完成的隐藏成就
    if (achievement.hidden && !isAchievementCompleted(achievement)) {
      return false
    }
    return true
  })

  const completedCount = ACHIEVEMENTS.filter(isAchievementCompleted).length
  const totalCreditsEarned = userAchievements
    .filter(ua => ua.claimed)
    .reduce((sum, ua) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId)
      return sum + (achievement?.reward.credits || 0)
    }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 成就概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-sm text-gray-600">已完成成就</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalCreditsEarned}</div>
                <div className="text-sm text-gray-600">奖励积分</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((completedCount / ACHIEVEMENTS.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">完成进度</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 成就分类 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="translation">翻译</TabsTrigger>
          <TabsTrigger value="social">社交</TabsTrigger>
          <TabsTrigger value="milestone">里程碑</TabsTrigger>
          <TabsTrigger value="special">特殊</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const progress = calculateProgress(achievement)
              const isCompleted = isAchievementCompleted(achievement)
              const isClaimed = isAchievementClaimed(achievement)
              const progressPercentage = (progress / achievement.requirement.target) * 100
              const Icon = achievement.icon

              return (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden border-2 ${getRarityColor(achievement.rarity)} ${getRarityBg(achievement.rarity)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-white'}`}>
                          <Icon className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{achievement.description}</p>

                    {/* 进度条 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>进度</span>
                        <span>{progress} / {achievement.requirement.target}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* 奖励信息 */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Gift className="w-4 h-4" />
                      <span>{achievement.reward.credits} 积分</span>
                      {achievement.reward.badge && (
                        <>
                          <span>•</span>
                          <span>徽章</span>
                        </>
                      )}
                      {achievement.reward.title && (
                        <>
                          <span>•</span>
                          <span>称号</span>
                        </>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    {isCompleted && !isClaimed && (
                      <Button 
                        onClick={() => claimReward(achievement.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        领取奖励
                      </Button>
                    )}

                    {isClaimed && (
                      <Button variant="outline" disabled className="w-full" size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        已领取
                      </Button>
                    )}

                    {!isCompleted && (
                      <Button variant="outline" disabled className="w-full" size="sm">
                        <Lock className="w-4 h-4 mr-2" />
                        未完成
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 成就通知组件
export function AchievementNotification({ 
  achievement, 
  onClose 
}: { 
  achievement: Achievement
  onClose: () => void 
}) {
  const Icon = achievement.icon

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 border-2 border-yellow-300 bg-yellow-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="font-semibold text-yellow-900">成就解锁！</div>
              <div className="text-sm text-yellow-700">{achievement.name}</div>
            </div>
          </div>
          
          <p className="text-sm text-yellow-800 mb-3">{achievement.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Gift className="w-4 h-4" />
              <span>+{achievement.reward.credits} 积分</span>
            </div>
            <Button size="sm" onClick={onClose}>
              领取
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
