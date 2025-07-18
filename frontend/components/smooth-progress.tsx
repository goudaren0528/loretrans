import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface SmoothProgressProps {
  value: number;
  className?: string;
  showPercentage?: boolean;
  animationDuration?: number;
}

/**
 * 平滑进度条组件
 * 避免进度突然跳跃，提供平滑的过渡效果
 */
export function SmoothProgress({ 
  value, 
  className = '', 
  showPercentage = true,
  animationDuration = 500 
}: SmoothProgressProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 如果新值与当前显示值不同，启动平滑过渡
    if (value !== displayValue) {
      // 避免进度倒退（除非是重置到0）
      if (value < displayValue && value !== 0) {
        console.log(`[SmoothProgress] 避免进度倒退: ${displayValue}% → ${value}%`);
        return;
      }

      setIsAnimating(true);
      
      // 使用动画过渡到新值
      const startValue = displayValue;
      const endValue = value;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // 使用缓动函数实现平滑过渡
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        setDisplayValue(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, displayValue, animationDuration]);

  return (
    <div className="space-y-2">
      {showPercentage && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className={`text-sm ${isAnimating ? 'text-blue-600' : 'text-gray-600'}`}>
            {displayValue}%
          </span>
        </div>
      )}
      <Progress 
        value={displayValue} 
        className={`transition-all duration-300 ${className}`}
      />
    </div>
  );
}
