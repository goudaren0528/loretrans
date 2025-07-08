import { Metadata } from 'next';
import { RefreshCw, AlertCircle, CheckCircle, HelpCircle, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditsRefreshButton, PaymentHelpDialog } from '@/components/ui/credits-refresh-button';

export const metadata: Metadata = {
  title: '积分问题帮助 - Loretrans',
  description: '解决积分显示、更新和支付相关问题',
};

export default function CreditsHelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">积分问题帮助中心</h1>
        <p className="text-gray-600 dark:text-gray-400">
          解决积分显示、更新和支付相关的常见问题
        </p>
      </div>

      {/* 快速解决方案 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            快速解决方案
          </CardTitle>
          <CardDescription>
            支付完成后积分没有立即显示？试试这些方法
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">刷新页面</h3>
                  <p className="text-sm text-gray-600">按 Ctrl+F5 强制刷新</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功率: 60%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">清除缓存</h3>
                  <p className="text-sm text-gray-600">浏览器设置 → 清除数据</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功率: 80%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">重新登录</h3>
                  <p className="text-sm text-gray-600">退出后重新登录账户</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功率: 95%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">无痕模式</h3>
                  <p className="text-sm text-gray-600">无痕窗口重新登录</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功率: 99%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <CreditsRefreshButton size="default" variant="default" />
            <PaymentHelpDialog />
          </div>
        </CardContent>
      </Card>

      {/* 详细步骤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>方法1: 强制刷新页面</CardTitle>
            <CardDescription>最简单的解决方案</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                <span>按住 <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">F5</kbd> (Windows)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                <span>或按 <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">R</kbd> (Mac)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                <span>等待页面完全加载后查看积分</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>方法2: 清除浏览器缓存</CardTitle>
            <CardDescription>解决缓存问题</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                <span>打开浏览器设置页面</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                <span>找到"隐私和安全"或"清除浏览数据"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                <span>选择"缓存的图片和文件"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                <span>点击清除，然后刷新页面</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>方法3: 重新登录</CardTitle>
            <CardDescription>刷新认证状态</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                <span>点击右上角用户头像</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                <span>选择"退出登录"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                <span>重新输入邮箱和密码登录</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                <span>登录后积分应该正确显示</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>方法4: 无痕模式测试</CardTitle>
            <CardDescription>确认是否为缓存问题</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                <span>按 <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">N</kbd> 打开无痕窗口</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                <span>在无痕窗口中访问网站</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                <span>重新登录您的账户</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                <span>如果积分正确显示，说明是缓存问题</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* 常见问题 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>常见问题解答</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Q: 支付成功了，但积分没有增加怎么办？</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A: 积分更新通常是即时的，但在高峰期可能需要1-3分钟。请先尝试刷新页面，如果超过5分钟仍未更新，请联系客服。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Q: 为什么会出现积分显示延迟？</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A: 主要原因包括：浏览器缓存、网络延迟、系统处理时间。大多数情况下通过刷新页面即可解决。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Q: 积分更新需要多长时间？</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A: 正常情况下是即时更新，高峰期可能需要1-3分钟，如果超过5分钟请联系客服。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 联系客服 */}
      <Alert>
        <MessageCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>如果以上方法都无法解决问题，请联系我们的客服团队</span>
            <Button variant="outline" size="sm">
              联系客服
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
