'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useCreditsRefresh } from '@/lib/hooks/useCreditsRefresh';

/**
 * 支付状态检查组件
 * 检查是否有待处理的支付，并在支付完成后刷新积分
 */
export function PaymentStatusChecker() {
  const { user } = useAuth();
  const { refreshAfterPayment } = useCreditsRefresh();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    // 检查是否有待处理的支付
    const checkPendingPayment = () => {
      try {
        const pendingPaymentStr = localStorage.getItem('pendingPayment');
        if (!pendingPaymentStr) return;

        const pendingPayment = JSON.parse(pendingPaymentStr);
        const { currentCredits, timestamp, credits: expectedCredits } = pendingPayment;

        // 检查支付是否在最近30分钟内
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        if (timestamp < thirtyMinutesAgo) {
          console.log('⏰ 待处理支付已过期，清除记录');
          localStorage.removeItem('pendingPayment');
          return;
        }

        console.log('🔍 检查待处理支付:', pendingPayment);
        console.log(`💰 支付前积分: ${currentCredits}`);
        console.log(`💰 当前积分: ${user.credits}`);
        console.log(`💰 预期增加: ${expectedCredits}`);

        // 检查积分是否已经更新
        const expectedTotalCredits = currentCredits + expectedCredits;
        
        if (user.credits >= expectedTotalCredits) {
          console.log('✅ 积分已更新，支付成功');
          localStorage.removeItem('pendingPayment');
        } else {
          console.log('⏳ 积分尚未更新，开始刷新流程');
          
          // 开始支付后的积分刷新流程
          refreshAfterPayment();
          
          // 设置定时器，如果5分钟后积分仍未更新，清除待处理支付记录
          setTimeout(() => {
            const updatedPendingPayment = localStorage.getItem('pendingPayment');
            if (updatedPendingPayment) {
              console.log('⚠️ 支付处理超时，清除待处理记录');
              localStorage.removeItem('pendingPayment');
            }
          }, 5 * 60 * 1000);
        }

      } catch (error) {
        console.error('❌ 检查待处理支付失败:', error);
        localStorage.removeItem('pendingPayment');
      }
    };

    // 页面加载时检查
    checkPendingPayment();

    // 监听storage变化（多标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingPayment') {
        checkPendingPayment();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [user, refreshAfterPayment]);

  // 这个组件不渲染任何UI
  return null;
}

/**
 * 手动触发积分刷新的Hook
 */
export function useManualCreditsRefresh() {
  const { refreshCreditsNow } = useCreditsRefresh();

  const triggerRefresh = async () => {
    try {
      await refreshCreditsNow();
      
      // 显示成功提示
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(100); // 轻微震动反馈
      }
      
      return true;
    } catch (error) {
      console.error('手动刷新积分失败:', error);
      return false;
    }
  };

  return { triggerRefresh };
}
