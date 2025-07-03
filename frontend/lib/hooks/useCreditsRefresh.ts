import { useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

/**
 * 积分实时刷新Hook
 * 用于在支付完成后自动刷新用户积分
 */
export function useCreditsRefresh() {
  const { refreshUser, user } = useAuth();

  // 定期刷新积分（用于支付后的实时更新）
  const startPeriodicRefresh = useCallback((intervalMs: number = 10000, maxAttempts: number = 6) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔄 定期刷新用户积分 (${attempts}/${maxAttempts})`);
      
      try {
        await refreshUser();
      } catch (error) {
        console.error('定期刷新失败:', error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.log('✅ 定期刷新完成');
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [refreshUser]);

  // 立即刷新积分
  const refreshCreditsNow = useCallback(async () => {
    console.log('💰 立即刷新用户积分...');
    try {
      await refreshUser();
      console.log('✅ 积分刷新成功');
    } catch (error) {
      console.error('❌ 积分刷新失败:', error);
      throw error;
    }
  }, [refreshUser]);

  // 支付完成后的积分刷新
  const refreshAfterPayment = useCallback(async () => {
    console.log('💳 支付完成，开始刷新积分...');
    
    // 立即刷新一次
    await refreshCreditsNow();
    
    // 等待2秒后再次刷新（给webhook处理时间）
    setTimeout(async () => {
      await refreshCreditsNow();
    }, 2000);
    
    // 开始定期刷新（每10秒一次，共6次）
    const cleanup = startPeriodicRefresh(10000, 6);
    
    // 60秒后停止定期刷新
    setTimeout(cleanup, 60000);
  }, [refreshCreditsNow, startPeriodicRefresh]);

  // 监听页面可见性变化，页面重新可见时刷新积分
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('📱 页面重新可见，刷新积分');
        refreshCreditsNow().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshCreditsNow, user]);

  // 监听焦点变化，窗口重新获得焦点时刷新积分
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        console.log('🎯 窗口重新获得焦点，刷新积分');
        refreshCreditsNow().catch(console.error);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshCreditsNow, user]);

  return {
    refreshCreditsNow,
    refreshAfterPayment,
    startPeriodicRefresh,
    currentCredits: user?.credits || 0
  };
}
