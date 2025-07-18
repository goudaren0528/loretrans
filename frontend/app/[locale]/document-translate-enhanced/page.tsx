import { Metadata } from 'next'
import { EnhancedDocumentTranslator } from '@/components/enhanced-document-translator'
import { AuthGuard } from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: '增强文档翻译 - 支持异步处理',
  description: '支持大文档异步翻译处理，避免超时问题',
}

export default function EnhancedDocumentTranslatePage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              增强文档翻译
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              支持大文档异步处理，避免超时问题
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                ✅ 小文档快速处理
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                ✅ 大文档异步处理
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                ✅ 实时进度监控
              </span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                ✅ 无超时限制
              </span>
            </div>
          </div>
          
          <EnhancedDocumentTranslator />
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">功能说明：</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>小文档</strong> (≤5块): 同步处理，30秒内完成</li>
              <li>• <strong>大文档</strong> (&gt;5块): 异步处理，后台队列处理</li>
              <li>• <strong>进度监控</strong>: 实时显示翻译进度</li>
              <li>• <strong>积分优化</strong>: 失败时不扣除积分</li>
              <li>• <strong>错误恢复</strong>: 自动重试和错误处理</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
