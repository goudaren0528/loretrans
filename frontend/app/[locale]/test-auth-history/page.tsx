'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslationHistory } from '@/lib/hooks/useTranslationHistory'

export default function TestAuthHistoryPage() {
  const { user, loading: authLoading, signIn, signOut, refreshUser } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'testpassword123'
  })
  const [isSigningIn, setIsSigningIn] = useState(false)

  const {
    history,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
    debugInfo: historyDebugInfo
  } = useTranslationHistory({
    debug: true
  })

  // 获取调试信息
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Failed to fetch debug info:', error)
    }
  }

  // 测试登录
  const handleTestSignIn = async () => {
    setIsSigningIn(true)
    try {
      const result = await signIn(testCredentials)
      console.log('Sign in result:', result)
      
      // 等待一下再刷新调试信息
      setTimeout(() => {
        fetchDebugInfo()
        refreshUser()
      }, 1000)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  // 测试登出
  const handleSignOut = async () => {
    try {
      await signOut()
      setTimeout(() => {
        fetchDebugInfo()
      }, 1000)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 刷新历史记录
  const handleRefreshHistory = async () => {
    try {
      await refreshHistory()
    } catch (error) {
      console.error('Refresh history error:', error)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  useEffect(() => {
    if (user) {
      console.log('User changed:', user)
      fetchDebugInfo()
    }
  }, [user])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">认证和历史记录调试页面</h1>
      
      {/* 认证状态 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">认证状态</h2>
        <div className="space-y-2">
          <p><strong>加载中:</strong> {authLoading ? '是' : '否'}</p>
          <p><strong>已登录:</strong> {user ? '是' : '否'}</p>
          {user && (
            <div className="bg-green-50 p-3 rounded">
              <p><strong>用户ID:</strong> {user.id}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>积分:</strong> {user.credits}</p>
              <p><strong>角色:</strong> {user.role}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-x-2">
          {!user ? (
            <>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  placeholder="邮箱"
                  value={testCredentials.email}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="border rounded px-3 py-1"
                />
                <input
                  type="password"
                  placeholder="密码"
                  value={testCredentials.password}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="border rounded px-3 py-1"
                />
              </div>
              <button
                onClick={handleTestSignIn}
                disabled={isSigningIn}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSigningIn ? '登录中...' : '测试登录'}
              </button>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              登出
            </button>
          )}
          <button
            onClick={fetchDebugInfo}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            刷新调试信息
          </button>
        </div>
      </div>

      {/* 历史记录状态 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">翻译历史记录</h2>
        <div className="space-y-2">
          <p><strong>加载中:</strong> {historyLoading ? '是' : '否'}</p>
          <p><strong>错误:</strong> {historyError || '无'}</p>
          <p><strong>记录数量:</strong> {history.length}</p>
          
          {historyDebugInfo && (
            <div className="bg-blue-50 p-3 rounded">
              <p><strong>调试信息:</strong></p>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(historyDebugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleRefreshHistory}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            刷新历史记录
          </button>
        </div>

        {/* 显示历史记录 */}
        {history.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">历史记录列表:</h3>
            <div className="space-y-2 max-h-60 overflow-auto">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-50 p-2 rounded text-sm">
                  <p><strong>类型:</strong> {item.job_type}</p>
                  <p><strong>状态:</strong> {item.status}</p>
                  <p><strong>语言:</strong> {item.source_language} → {item.target_language}</p>
                  <p><strong>时间:</strong> {new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 调试信息 */}
      {debugInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">系统调试信息</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">认证状态:</h3>
              <p className={`text-sm ${debugInfo.authenticated ? 'text-green-600' : 'text-red-600'}`}>
                {debugInfo.authenticated ? '已认证' : '未认证'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Cookies:</h3>
              <p className="text-sm">数量: {debugInfo.debugInfo?.cookies?.count || 0}</p>
              <p className="text-sm">包含认证Cookies: {debugInfo.debugInfo?.cookies?.hasAuthCookies ? '是' : '否'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">详细信息:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo.debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
