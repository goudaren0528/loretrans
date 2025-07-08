'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DemoPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const plan = searchParams.get('plan') || 'basic';
  const price = searchParams.get('price') || '5';
  const credits = searchParams.get('credits') || '5000';

  const handlePayment = async (action: 'success' | 'cancel') => {
    setProcessing(true);
    
    // 模拟支付处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (action === 'success') {
      // 重定向到成功页面
      router.push('/payment-success?demo=true&plan=' + plan);
    } else {
      // 重定向到取消页面
      router.push('/pricing?purchase=canceled&demo=true');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <span className="text-2xl">💳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            演示支付页面
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            这是一个演示页面，用于测试支付流程
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                演示模式
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>这是一个演示支付页面。真实的支付需要配置有效的CREEM API密钥。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">订单详情</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">套餐:</span>
              <span className="font-medium">{plan === 'basic' ? 'Basic Pack' : plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">积分:</span>
              <span className="font-medium">{credits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">价格:</span>
              <span className="font-medium">${price}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handlePayment('success')}
            disabled={processing}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }`}
          >
            {processing ? '🔄 处理中...' : '✅ 模拟成功支付'}
          </button>

          <button
            onClick={() => handlePayment('cancel')}
            disabled={processing}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              processing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {processing ? '🔄 处理中...' : '❌ 取消支付'}
          </button>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            🔧 开发者信息
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>问题:</strong> CREEM API密钥无效 (403 Forbidden)</p>
            <p><strong>解决方案:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>获取有效的CREEM API密钥</li>
              <li>在CREEM控制台创建产品</li>
              <li>更新环境变量配置</li>
              <li>替换演示URL为真实支付链接</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
