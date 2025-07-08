'use client';

import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/components/ui/use-toast';

interface CreditsRefreshButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
  className?: string;
}

export function CreditsRefreshButton({ 
  size = 'sm', 
  variant = 'ghost',
  showText = true,
  className = '' 
}: CreditsRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { refreshUser, user } = useAuth();
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    
    try {
      console.log('🔄 手动刷新用户积分...');
      
      // 记录刷新前的积分
      const beforeCredits = user?.credits || 0;
      
      // 刷新用户数据
      await refreshUser();
      
      // 等待一小段时间让状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLastRefresh(new Date());
      
      // 检查积分是否有变化
      const afterCredits = user?.credits || 0;
      const creditsDiff = afterCredits - beforeCredits;
      
      if (creditsDiff > 0) {
        toast({
          title: "积分已更新！",
          description: `您的积分增加了 ${creditsDiff.toLocaleString()}`,
        });
      } else if (creditsDiff < 0) {
        toast({
          title: "积分已更新",
          description: `您的积分减少了 ${Math.abs(creditsDiff).toLocaleString()}`,
        });
      } else {
        toast({
          title: "积分已刷新",
          description: `当前积分: ${afterCredits.toLocaleString()}`,
        });
      }
      
      console.log('✅ 积分刷新完成');
      
    } catch (error) {
      console.error('❌ 积分刷新失败:', error);
      
      toast({
        title: "刷新失败",
        description: "无法刷新积分，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getButtonText = () => {
    if (isRefreshing) return '刷新中...';
    if (lastRefresh) {
      const timeDiff = Date.now() - lastRefresh.getTime();
      if (timeDiff < 60000) { // 1分钟内
        return '已刷新';
      }
    }
    return '刷新积分';
  };

  const getIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (lastRefresh && Date.now() - lastRefresh.getTime() < 60000) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`${className} ${isRefreshing ? 'opacity-70' : ''}`}
      title="刷新积分余额"
    >
      {getIcon()}
      {showText && (
        <span className="ml-2">
          {getButtonText()}
        </span>
      )}
    </Button>
  );
}

// 积分显示组件（带刷新功能）
export function CreditsDisplayWithRefresh({ 
  credits, 
  className = '',
  showRefreshButton = true 
}: { 
  credits: number; 
  className?: string;
  showRefreshButton?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">积分:</span>
        <span className="font-semibold text-lg">
          {credits.toLocaleString()}
        </span>
      </div>
      
      {showRefreshButton && (
        <CreditsRefreshButton 
          size="sm" 
          variant="ghost" 
          showText={false}
          className="h-6 w-6 p-0"
        />
      )}
    </div>
  );
}

// 支付问题帮助组件
export function PaymentHelpDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const helpSteps = [
    {
      title: '刷新页面',
      description: '按 Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)',
      difficulty: '简单',
      successRate: '60%'
    },
    {
      title: '清除缓存',
      description: '浏览器设置 → 清除浏览数据 → 缓存文件',
      difficulty: '中等',
      successRate: '80%'
    },
    {
      title: '重新登录',
      description: '退出登录后重新登录您的账户',
      difficulty: '简单',
      successRate: '95%'
    },
    {
      title: '无痕模式',
      description: '在无痕窗口中重新登录测试',
      difficulty: '高级',
      successRate: '99%'
    }
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs"
      >
        <AlertCircle className="h-3 w-3 mr-1" />
        积分未更新？
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">积分显示问题解决方案</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              {helpSteps.map((step, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {step.successRate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 如果以上方法都无法解决，请联系客服或发送邮件至 support@example.com
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
