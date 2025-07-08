'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 开始测试支付流程...');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'basic'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ 支付API调用成功:', data);
        setResult(data);

        // 如果有支付URL，可以选择跳转
        if (data.url) {
          console.log('🔗 支付URL:', data.url);
          // window.open(data.url, '_blank'); // 可以取消注释来自动打开支付页面
        }
      } else {
        console.error('❌ 支付API调用失败:', data);
        setError(data.error || '支付请求失败');
      }
    } catch (err) {
      console.error('❌ 网络错误:', err);
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 CREEM支付测试
        </h1>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-blue-800 mb-2">测试信息</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 计划: Basic Pack (5000 积分)</li>
              <li>• 价格: $5.00</li>
              <li>• 环境: 开发测试</li>
            </ul>
          </div>

          <button
            onClick={testPayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {loading ? '🔄 测试中...' : '🚀 测试支付流程'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">❌ 错误信息</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">✅ 成功响应</h3>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>方法:</strong> {result.method}</p>
                <p><strong>Checkout ID:</strong> {result.checkout_id}</p>
                <p><strong>Request ID:</strong> {result.request_id}</p>
                {result.url && (
                  <div>
                    <p><strong>支付URL:</strong></p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {result.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">📋 测试说明</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. 点击测试按钮发起支付请求</li>
              <li>2. 检查控制台日志查看详细信息</li>
              <li>3. 如果成功，会显示支付URL</li>
              <li>4. 可以点击URL进行实际支付测试</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ 注意事项</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 这是测试环境，不会产生真实费用</li>
              <li>• 如果出现403错误，需要检查CREEM控制台权限</li>
              <li>• 网络连接问题已通过DNS修复解决</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
