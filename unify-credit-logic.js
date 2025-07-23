#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'frontend/app/api/translate/route.ts');

console.log('🔧 统一文本翻译和文档翻译的积分检查逻辑...');

// 读取当前文件内容
let content = fs.readFileSync(routeFilePath, 'utf8');

// 移除有问题的积分检查逻辑（包含未定义的FREE_LIMIT）
const problematicLogic = `    const needsCredits = text.length > FREE_LIMIT && user;
    
    if (needsCredits) {
      console.log(\`[Text Translation] 长文本翻译需要积分检查: \${text.length}字符\`);
      
      // 计算所需积分
      const creditService = createServerCreditService()
      const calculation = creditService.calculateCreditsRequired(text.length)

      // 获取用户积分
      let userCredits = 0
      try {
        const supabase = createSupabaseAdminClient()
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()

        if (userError) {
          if (userError.code === 'PGRST116') {
            // 用户记录不存在，创建新记录
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{ 
                id: user.id, 
                email: user.email,
                credits: 3000 
              }])
              .select('credits')
              .single()
            
            if (!createError && newUser) {
              userCredits = newUser.credits
            }
          }
        } else if (userData) {
          userCredits = userData.credentials
        }
      } catch (error) {
        console.error('[Text Translation] 积分查询异常:', error)
      }

      // 检查积分是否足够
      if (calculation.credits_required > 0 && userCredits < calculation.credits_required) {
        return NextResponse.json({
          error: \`积分不足，需要 \${calculation.credits_required} 积分，当前余额 \${userCredits} 积分\`,
          code: 'INSUFFICIENT_CREDITS',
          required: calculation.credits_required,
          available: userCredits
        }, { status: 402 })
      }

      // 先扣除积分（如果需要）
      if (calculation.credits_required > 0) {
        try {
          const supabase = createSupabaseAdminClient()
          const { error: deductError } = await supabase
            .from('users')
            .update({ credits: userCredits - calculation.credits_required })
            .eq('id', user.id)

          if (deductError) {
            console.error('[Text Translation] 积分扣除失败:', deductError)
            return NextResponse.json({
              error: '积分扣除失败，请重试',
              code: 'CREDIT_DEDUCTION_FAILED'
            }, { status: 500 })
          }
          
          console.log(\`[Text Translation] 积分扣除成功: \${calculation.credits_required} 积分，剩余: \${userCredits - calculation.credits_required}\`)
        } catch (error) {
          console.error('[Text Translation] 积分扣除异常:', error)
          return NextResponse.json({
            error: '积分扣除失败，请重试',
            code: 'CREDIT_DEDUCTION_ERROR'
          }, { status: 500 })
        }
      }
      
      creditsRequired = calculation.credits_required
      userCredits = userCredits - calculation.credits_required
    }`;

// 替换为与文档翻译完全一致的逻辑
const unifiedCreditLogic = `    // 积分检查和扣除（与文档翻译逻辑完全一致）
    if (user) {
      // 计算所需积分
      const creditService = createServerCreditService()
      const calculation = creditService.calculateCreditsRequired(characterCount)
      creditsRequired = calculation.credits_required

      // 获取用户积分
      try {
        const supabase = createSupabaseAdminClient()
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()

        if (userError) {
          if (userError.code === 'PGRST116') {
            // 用户记录不存在，创建新记录
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{ 
                id: user.id, 
                email: user.email,
                credits: 3000 
              }])
              .select('credits')
              .single()
            
            if (!createError && newUser) {
              userCredits = newUser.credits
            }
          } else {
            console.error('[Text Translation] 查询用户积分失败:', userError)
          }
        } else if (userData) {
          userCredits = userData.credits
        }
      } catch (error) {
        console.error('[Text Translation] 积分查询异常:', error)
      }

      // 检查积分是否足够
      if (calculation.credits_required > 0 && userCredits < calculation.credits_required) {
        return NextResponse.json({
          error: \`积分不足，需要 \${calculation.credits_required} 积分，当前余额 \${userCredits} 积分\`,
          code: 'INSUFFICIENT_CREDITS',
          required: calculation.credits_required,
          available: userCredits
        }, { status: 402 })
      }

      // 先扣除积分（如果需要）
      if (calculation.credits_required > 0) {
        try {
          const supabase = createSupabaseAdminClient()
          const { error: deductError } = await supabase
            .from('users')
            .update({ credits: userCredits - calculation.credits_required })
            .eq('id', user.id)

          if (deductError) {
            console.error('[Text Translation] 积分扣除失败:', deductError)
            return NextResponse.json({
              error: '积分扣除失败，请重试',
              code: 'CREDIT_DEDUCTION_FAILED'
            }, { status: 500 })
          }
          
          console.log(\`[Text Translation] 积分扣除成功: \${calculation.credits_required} 积分，剩余: \${userCredits - calculation.credits_required}\`)
        } catch (error) {
          console.error('[Text Translation] 积分扣除异常:', error)
          return NextResponse.json({
            error: '积分扣除失败，请重试',
            code: 'CREDIT_DEDUCTION_ERROR'
          }, { status: 500 })
        }
      }
    }`;

// 查找并替换
if (content.includes('const needsCredits = text.length > FREE_LIMIT && user;')) {
  content = content.replace(problematicLogic, unifiedCreditLogic);
  console.log('✅ 已统一积分检查逻辑');
} else {
  console.log('⚠️  未找到预期的积分检查代码');
}

// 移除其他可能的重复逻辑
const otherCreditLogic = `    if (needsCredits) {
      const creditService = createServerCreditService();
      const calculation = creditService.calculateCreditsRequired(text.length);
      creditsRequired = calculation.credits_required;
    }`;

if (content.includes(otherCreditLogic)) {
  content = content.replace(otherCreditLogic, '');
  console.log('✅ 已移除其他重复的积分计算');
}

// 写回文件
fs.writeFileSync(routeFilePath, content, 'utf8');

console.log('✅ 积分检查逻辑统一完成');
console.log('🔄 请重启开发服务器以应用更改');
