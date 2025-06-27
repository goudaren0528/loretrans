import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { createServerCreditService } from '@/lib/services/credits'

// 文件大小限制配置
const FILE_SIZE_LIMITS = {
  guest: 0, // 未登录用户不支持文档翻译
  free_user: 5 * 1024 * 1024, // 5MB
  pro_user: 50 * 1024 * 1024, // 50MB
  admin: 50 * 1024 * 1024, // 50MB
}

// 支持的文件类型
const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain'
]

async function uploadHandler(req: NextRequestWithUser) {
  try {
    const { user, role } = req.userContext

    // 检查用户权限
    if (!user) {
      return NextResponse.json({
        error: '文档翻译需要登录账户',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        error: '请选择要上传的文件',
        code: 'FILE_REQUIRED'
      }, { status: 400 })
    }

    // 检查文件类型
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: '不支持的文件格式，请上传PDF、Word、PowerPoint或文本文件',
        code: 'UNSUPPORTED_FILE_TYPE'
      }, { status: 400 })
    }

    // 检查文件大小限制
    const sizeLimit = FILE_SIZE_LIMITS[role as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.free_user
    if (file.size > sizeLimit) {
      const limitMB = Math.round(sizeLimit / (1024 * 1024))
      return NextResponse.json({
        error: `文件大小超出限制，${role === 'free_user' ? '免费用户' : '付费用户'}最大支持${limitMB}MB`,
        code: 'FILE_TOO_LARGE',
        limit: sizeLimit,
        current: file.size
      }, { status: 400 })
    }

    // 调用文件处理微服务
    const fileServiceUrl = process.env.FILE_SERVICE_URL || 'http://localhost:3010'
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('userId', user.id)

    const uploadResponse = await fetch(`${fileServiceUrl}/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    if (!uploadResponse.ok) {
      throw new Error('文件上传失败')
    }

    const uploadResult = await uploadResponse.json()

    // 提取文本内容
    const extractResponse = await fetch(`${fileServiceUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: uploadResult.fileId,
        userId: user.id
      }),
    })

    if (!extractResponse.ok) {
      throw new Error('文本提取失败')
    }

    const extractResult = await extractResponse.json()
    const { text, characterCount } = extractResult

    // 计算积分消耗
    const creditService = createServerCreditService()
    const calculation = creditService.calculateCreditsRequired(characterCount)

    // 检查用户积分余额
    const userCredits = await creditService.getUserCredits(user.id)
    const hasEnoughCredits = userCredits >= calculation.credits_required

    return NextResponse.json({
      success: true,
      fileId: uploadResult.fileId,
      fileName: file.name,
      fileSize: file.size,
      extractedText: text.substring(0, 500) + (text.length > 500 ? '...' : ''), // 只返回前500字符预览
      characterCount,
      creditCalculation: calculation,
      userCredits,
      hasEnoughCredits,
      canProceed: calculation.credits_required === 0 || hasEnoughCredits
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({
      error: '文档处理失败，请重试',
      code: 'PROCESSING_ERROR'
    }, { status: 500 })
  }
}

// 要求至少是注册用户
export const POST = withApiAuth(uploadHandler, ['free_user', 'pro_user', 'admin'])

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
