import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/services/translation'
import { getTranslationCacheKey, withCache } from '@/lib/services/cache'
import { 
  apiResponse, 
  apiError, 
  validateMethod, 
  parseRequestBody, 
  validateRequiredFields,
  validateTextLength,
  sanitizeText,
  getClientIP,
  ApiErrorCodes,
  withApiAuth,
  type NextRequestWithUser
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerCreditService } from '@/lib/services/credits'
import { getLocale, getTranslations } from 'next-intl/server'

interface TranslateRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  // 双向翻译增强参数
  mode?: 'single' | 'bidirectional' | 'batch' | 'auto-direction'
  options?: {
    enableCache?: boolean
    enableFallback?: boolean
    priority?: 'speed' | 'quality'
    format?: 'text' | 'structured'
    autoDetectDirection?: boolean // 智能检测翻译方向
  }
  // 批量翻译支持
  texts?: string[]
}

async function translateHandler(req: NextRequestWithUser) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Errors' });

  console.log(`[POST /api/translate] user ${req.userContext.user.id} initiated translation.`);
  const creditService = createServerCreditService();
  const { text, sourceLang, targetLang } = await req.json()
  const { user, role } = req.userContext

  if (!user) {
    return NextResponse.json({ error: t('user_not_authenticated') }, { status: 401 });
  }
  const userId = user.id;
  console.log(`Authenticated user ${userId} initiated translation.`);

  if (!text || !sourceLang || !targetLang) {
    return NextResponse.json(
      { error: t('missing_parameters') },
      { status: 400 }
    )
  }

  const characterCount = text.length;
  console.log(`Request details: ${characterCount} characters, from ${sourceLang} to ${targetLang}.`);

  try {
    // Step 1: Calculate credits required (500 chars free, then 0.1 credits/char)
    const calculation = creditService.calculateCreditsRequired(characterCount);
    console.log(`Credit calculation for user ${userId}:`, {
      total_characters: calculation.total_characters,
      free_characters: calculation.free_characters,
      billable_characters: calculation.billable_characters,
      credits_required: calculation.credits_required
    });

    // Step 2: Consume credits only if required
    if (calculation.credits_required > 0) {
      console.log(`Attempting to consume ${calculation.credits_required} credits for user ${userId}.`);
      
      const consumeResult = await creditService.consumeTranslationCredits(
        userId,
        characterCount,
        sourceLang,
        targetLang,
        'text'
      );

      if (!consumeResult.success) {
        console.error(`Credit consumption failed for user ${userId}:`, consumeResult);
        return NextResponse.json({ 
          error: t('insufficient_credits'),
          calculation: consumeResult.calculation
        }, { status: 402 });
      }
      
      console.log(`Successfully consumed ${calculation.credits_required} credits for user ${userId}.`);
    } else {
      console.log(`Translation is free for user ${userId} (${characterCount} chars <= 500 free limit).`);
    }

    try {
      // Step 3: Perform translation
      console.log('Proceeding to call translation service.');
      const translationResponse = await translateText({ 
        text, 
        sourceLanguage: sourceLang, 
        targetLanguage: targetLang 
      });
      
      if (!translationResponse || !translationResponse.translatedText) {
        throw new Error(t('translation_invalid_response'));
      }
      
      console.log(`Translation successful for user ${userId}. Method: ${translationResponse.method}`);
      return NextResponse.json({ 
        translatedText: translationResponse.translatedText,
        calculation: calculation,
        method: translationResponse.method
      });

    } catch (translationError: any) {
      console.error(`Translation failed for user ${userId}. Attempting to refund credits.`, translationError);
      
      // Step 4: Refund credits if translation fails and credits were consumed
      if (calculation.credits_required > 0) {
        const refundSuccess = await creditService.rewardCredits(
          userId,
          calculation.credits_required,
          'Refund for failed translation',
          {
            original_request: {
              character_count: characterCount,
              source_language: sourceLang,
              target_language: targetLang
            },
            error_message: translationError.message
          }
        );

        if (!refundSuccess) {
          console.error(`CRITICAL: Credit refund failed for user ${userId} after translation failure. Manual intervention required.`);
          return NextResponse.json({ 
            error: t('translation_failed_refund_failed', { error: translationError.message }) 
          }, { status: 500 });
        }
        
        console.log(`Successfully refunded ${calculation.credits_required} credits to user ${userId} after failed translation.`);
      }
      
      return NextResponse.json({ 
        error: t('translation_failed', { error: translationError.message }) 
      }, { status: 500 });
    }
  } catch (e: any) {
    console.error('An unexpected error occurred in the translation endpoint:', e);
    return NextResponse.json({ 
      error: t('unexpected_error', { error: e.message }) 
    }, { status: 500 });
  }
}

// 使用 withApiAuth 包装处理器，并要求至少是 free_user 角色
export const POST = withApiAuth(translateHandler, ['free_user', 'pro_user', 'admin'])

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
} 