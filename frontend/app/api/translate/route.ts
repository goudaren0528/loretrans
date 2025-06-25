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
  const supabase = createServerSupabaseClient();
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
    // Step 1: Consume credits
    console.log(`Attempting to consume ${characterCount} credits for user ${userId}.`);
    const { error: creditError } = await supabase.rpc('consume_credits_for_translation', {
      p_user_id: userId,
      p_amount: characterCount,
      p_description: `Translation from ${sourceLang} to ${targetLang}`
    });

    if (creditError) {
      console.error(`Credit consumption failed for user ${userId}:`, creditError.message);
      if (creditError.message.includes('Insufficient credits')) {
        return NextResponse.json({ error: t('insufficient_credits') }, { status: 402 });
      }
      return NextResponse.json({ error: t('credit_error', { error: creditError.message }) }, { status: 500 });
    }
    console.log(`Successfully consumed ${characterCount} credits for user ${userId}.`);

    try {
      // Step 2: Perform translation
      console.log('Proceeding to call translation service.');
      const translationResponse = await translateText({ text, sourceLanguage: sourceLang, targetLanguage: targetLang });
      
      if (!translationResponse || !translationResponse.translatedText) {
        throw new Error(t('translation_invalid_response'));
      }
      
      console.log(`Translation successful for user ${userId}. Method: ${translationResponse.method}`);
      return NextResponse.json({ translatedText: translationResponse.translatedText });

    } catch (translationError: any) {
        console.error(`Translation failed for user ${userId}. Attempting to refund credits.`, translationError);
        
        // Step 3: Refund credits if translation fails
        const { error: refundError } = await supabase.rpc('refund_credits', {
            p_user_id: userId,
            p_amount: characterCount,
            p_description: 'Refund for failed translation'
        });

        if (refundError) {
            console.error(`CRITICAL: Credit refund failed for user ${userId} after translation failure. Manual intervention required.`, refundError);
            // Still return the original translation error to the user
            return NextResponse.json({ error: t('translation_failed_refund_failed', { error: translationError.message }) }, { status: 500 });
        }
        
        console.log(`Successfully refunded ${characterCount} credits to user ${userId} after failed translation.`);
        return NextResponse.json({ error: t('translation_failed', { error: translationError.message }) }, { status: 500 });
    }
  } catch (e: any) {
    console.error('An unexpected error occurred in the translation endpoint:', e);
    return NextResponse.json({ error: t('unexpected_error', { error: e.message }) }, { status: 500 });
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