'use client'

import React, { useState, useMemo } from 'react'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'

// 根据 docs/credits-and-pricing.md 的定义
const CHARS_PER_CREDIT = 100
const MINIMUM_COST = 0.1

/**
 * 计算翻译所需积分的函数
 * @param charCount - 字符数
 * @returns 消耗的积分
 */
export const calculateCreditCost = (charCount: number): number => {
  if (charCount === 0) {
    return 0
  }
  
  const cost = charCount / CHARS_PER_CREDIT
  
  if (cost < MINIMUM_COST) {
    return MINIMUM_COST
  }
  
  // 将结果舍入到小数点后两位
  return Math.ceil(cost * 100) / 100
}

export const CostCalculator: React.FC = () => {
  const [text, setText] = useState('')

  const creditCost = useMemo(() => calculateCreditCost(text.length), [text])

  return (
    <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">积分消耗计算器</h2>
      <div className="grid w-full gap-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="text-input">输入文本</Label>
          <Textarea
            id="text-input"
            placeholder="在此处粘贴或输入您的文本以计算积分消耗..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] resize-y"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>当前字符数: {text.length}</p>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-md bg-muted">
          <span className="font-medium">预估消耗积分:</span>
          <span className="text-2xl font-bold text-primary">
            {creditCost.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground pt-2">
          <p>
            计费规则: 每 {CHARS_PER_CREDIT} 个字符消耗 1 积分。最低消费为 {MINIMUM_COST} 积分。
          </p>
        </div>
      </div>
    </div>
  )
} 