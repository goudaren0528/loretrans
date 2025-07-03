'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Zap, 
  Calendar, 
  Globe, 
  Coins,
  Target,
  User,
  History
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AchievementSystem } from '@/components/achievements/achievement-system'
import { CreditBalance } from '@/components/credits/credit-balance'
import { useRouter } from 'next/navigation'

interface UserStats {
  translations: number
  characters: number
  languages: number
  daily_streak: number
  monthly_translations: number
  monthly_characters: number
  member_since: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // 如果未登录，重定向到登录页面
  if (!loading && !user) {
    router.push('/auth/signin?redirect=/dashboard')
    return null
  }

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/personal-stats', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const getAuthToken = async () => {
    // 获取用户认证token的逻辑
    return 'user-token'
  }

  // 加载用户个人统计数据
  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user, loadUserStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            我的翻译中心
          </h1>
          <p className="text-gray-600">
            管理您的翻译记录、成就进度和账户设置
          </p>
        </div>

        {/* 个人统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '--' : userStats?.translations || 0}
                  </div>
                  <div className="text-sm text-gray-600">我的翻译次数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '--' : userStats?.languages || 0}
                  </div>
                  <div className="text-sm text-gray-600">使用语言数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '--' : userStats?.daily_streak || 0}
                  </div>
                  <div className="text-sm text-gray-600">连续使用天数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <CreditBalance showDetails={false} />
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              我的成就
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              翻译历史
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              账户设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 本月统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    本月使用情况
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">翻译次数</span>
                      <span className="font-semibold">
                        {statsLoading ? '--' : userStats?.monthly_translations || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">翻译字符</span>
                      <span className="font-semibold">
                        {statsLoading ? '--' : (userStats?.monthly_characters || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">连续使用</span>
                      <span className="font-semibold">
                        {statsLoading ? '--' : userStats?.daily_streak || 0} 天
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">注册时间</span>
                      <span className="font-semibold">
                        {userStats?.member_since ? 
                          new Date(userStats.member_since).toLocaleDateString('zh-CN') : 
                          '--'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => router.push('/text-translate')}
                      className="w-full flex items-center gap-2 h-12"
                    >
                      <Zap className="w-5 h-5" />
                      开始翻译
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/pricing')}
                      className="w-full flex items-center gap-2 h-12"
                    >
                      <Coins className="w-5 h-5" />
                      充值积分
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('achievements')}
                      className="w-full flex items-center gap-2 h-12"
                    >
                      <Trophy className="w-5 h-5" />
                      查看成就
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementSystem />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>翻译历史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>翻译历史功能正在开发中...</p>
                  <p className="text-sm">即将为您提供完整的翻译记录</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>账户设置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      邮箱地址
                    </label>
                    <div className="text-gray-900">{user?.email}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      用户ID
                    </label>
                    <div className="text-gray-900 font-mono text-sm">{user?.id}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      注册时间
                    </label>
                    <div className="text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '--'}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="mr-4">
                      修改密码
                    </Button>
                    <Button variant="outline">
                      导出我的数据
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
