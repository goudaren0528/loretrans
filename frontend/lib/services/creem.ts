/**
 * Creem Payment Service
 * 基于Creem官方REST API实现的支付服务
 * 包含网络连接修复功能
 */

import { APP_CONFIG } from '@/config/app.config'

// 导入网络修复工具
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createNetworkAdapter, createCryptoUtils } = require('../../lib/creem-network-fix.js');

// 创建网络适配器和加密工具
const networkAdapter = createNetworkAdapter();
const cryptoUtils = createCryptoUtils();

export interface CreemCheckoutParams {
  product_id: string
  customer_email?: string
  success_url?: string
  cancel_url?: string
  request_id?: string
  metadata?: Record<string, string>
  customer?: {
    email: string
  }
}

export interface CreemCheckoutResponse {
  id: string
  checkout_url: string
  product_id: string
  customer_email?: string
  status: string
  created_at: string
  request_id?: string
}

export interface CreemProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  active: boolean
}

export class CreemService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error('Creem API key is required')
    }
    this.apiKey = apiKey
    this.baseUrl = 'https://api.creem.io/v1'
    
    // 网络适配器已在模块顶部初始化
  }

  /**
   * 创建支付会话
   */
  async createCheckout(params: CreemCheckoutParams): Promise<CreemCheckoutResponse> {
    console.log('Creating Creem checkout with params:', params)

    try {
      // 使用网络适配器进行请求
      const response = typeof window === 'undefined' 
        ? await networkAdapter.request({
            url: `${this.baseUrl}/checkouts`,
            method: 'POST',
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            },
            data: params
          })
        : await fetch(`${this.baseUrl}/checkouts`, {
            method: 'POST',
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
          });

      // 统一处理响应格式
      const isNetworkAdapter = typeof window === 'undefined';
      const responseOk = isNetworkAdapter ? response.status < 400 : response.ok;
      
      if (!responseOk) {
        const errorText = isNetworkAdapter ? JSON.stringify(response.data) : await response.text()
        let errorData: any = {}
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        console.error('Creem API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        // 提供更详细的错误信息
        let errorMessage = `Creem API error: ${response.status} ${response.statusText}`
        
        if (response.status === 403) {
          errorMessage = 'API key permissions insufficient. Please check your CREEM dashboard.'
        } else if (response.status === 404) {
          errorMessage = 'Product not found. Please verify your product configuration.'
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        throw new Error(errorMessage)
      }

      const result = isNetworkAdapter ? response.data : await response.json()
      console.log('Creem checkout created successfully:', result.id)
      return result
    } catch (error) {
      console.error('Failed to create Creem checkout:', error)
      
      // 如果是网络错误，提供更友好的错误信息
      if (error && typeof error === 'object' && 'code' in error && 
          (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND')) {
        throw new Error('Network connectivity issue. Please check your internet connection and try again.')
      }
      
      throw error
    }
  }

  /**
   * 获取产品信息
   */
  async getProduct(productId: string): Promise<CreemProduct> {
    try {
      // 使用网络适配器进行请求
      const response = typeof window === 'undefined' 
        ? await networkAdapter.request({
            url: `${this.baseUrl}/products/${productId}`,
            method: 'GET',
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            }
          })
        : await fetch(`${this.baseUrl}/products/${productId}`, {
            method: 'GET',
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            }
          });

      // 统一处理响应格式
      const isNetworkAdapter = typeof window === 'undefined';
      const responseOk = isNetworkAdapter ? response.status < 400 : response.ok;

      if (!responseOk) {
        const errorText = isNetworkAdapter ? JSON.stringify(response.data) : await response.text()
        let errorData: any = {}
        try {
          errorData = isNetworkAdapter ? response.data : JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        let errorMessage = `Creem API error: ${response.status} ${response.statusText}`
        if (errorData.message) {
          errorMessage = errorData.message
        }
        
        throw new Error(errorMessage)
      }

      return isNetworkAdapter ? response.data : await response.json()
    } catch (error) {
      console.error('Failed to get Creem product:', error)
      throw error
    }
  }

  /**
   * 验证Webhook签名
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // TODO: 实现Creem Webhook签名验证逻辑
    console.log('Verifying Creem webhook signature')
    
    // 临时实现 - 生产环境需要实现真实的签名验证
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    
    try {
      // 根据Creem文档实现签名验证
      return true // 临时返回true
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }
}

// 创建服务实例 - 仅在服务端使用
export const creemService = APP_CONFIG.creem.apiKey 
  ? new CreemService(APP_CONFIG.creem.apiKey)
  : null

// Mock服务用于开发测试
export class MockCreemService extends CreemService {
  constructor() {
    super('mock_api_key')
  }

  async createCheckout(params: CreemCheckoutParams): Promise<CreemCheckoutResponse> {
    console.log('Mock Creem Checkout Create called with:', params)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    const checkoutId = `cs_mock_${Date.now()}`
    
    // 使用本地Mock支付页面
    const mockUrl = new URL('/checkout/mock', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    mockUrl.searchParams.set('checkout_id', checkoutId)
    mockUrl.searchParams.set('product_id', params.product_id)
    if (params.customer?.email) {
      mockUrl.searchParams.set('customer_email', params.customer.email)
    }
    if (params.success_url) {
      mockUrl.searchParams.set('success_url', params.success_url)
    }
    if (params.cancel_url) {
      mockUrl.searchParams.set('cancel_url', params.cancel_url)
    }
    
    console.log('Mock checkout URL generated:', mockUrl.toString())
    
    return {
      id: checkoutId,
      checkout_url: mockUrl.toString(),
      product_id: params.product_id,
      customer_email: params.customer?.email,
      status: 'pending',
      created_at: new Date().toISOString(),
      request_id: params.request_id
    }
  }

  async getProduct(productId: string): Promise<CreemProduct> {
    console.log('Mock Creem Get Product called with:', productId)
    
    // 模拟产品数据
    const mockProducts: Record<string, CreemProduct> = {
      'prod_1000_credits': {
        id: 'prod_1000_credits',
        name: '1,000 Credits',
        description: 'Perfect for light usage',
        price: 199, // 价格以分为单位
        currency: 'USD',
        active: true
      },
      'prod_5000_credits': {
        id: 'prod_5000_credits',
        name: '5,000 Credits',
        description: 'Great value for regular users',
        price: 899,
        currency: 'USD',
        active: true
      }
    }

    const product = mockProducts[productId]
    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    return product
  }
}

// 根据环境和配置选择服务实例
export const creem = (() => {
  // 如果没有配置API密钥，使用Mock服务
  if (!APP_CONFIG.creem.apiKey) {
    console.log('Using Mock Creem Service (no API key configured)')
    return new MockCreemService()
  }
  
  // 如果是开发环境且明确要求使用Mock
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_CREEM === 'true') {
    console.log('Using Mock Creem Service (development mode)')
    return new MockCreemService()
  }
  
  // 使用真实服务
  return creemService
})()

// 为了兼容性，也导出为 creemServer
export const creemServer = creem
