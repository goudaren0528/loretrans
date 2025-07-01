/**
 * Creem Payment Service
 * 基于Creem官方REST API实现的支付服务
 */

import { APP_CONFIG } from '@/config/app.config'

export interface CreemCheckoutParams {
  product_id: string
  customer_email?: string
  success_url?: string
  cancel_url?: string
  request_id?: string
}

export interface CreemCheckoutResponse {
  id: string
  url: string
  product_id: string
  customer_email?: string
  status: string
  created_at: string
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

  constructor(apiKey?: string, testMode = false) {
    if (!apiKey) {
      throw new Error('Creem API key is required')
    }
    this.apiKey = apiKey
    this.baseUrl = testMode 
      ? 'https://api.creem.io/test/v1' 
      : 'https://api.creem.io/v1'
  }

  /**
   * 创建支付会话
   */
  async createCheckout(params: CreemCheckoutParams): Promise<CreemCheckoutResponse> {
    console.log('Creating Creem checkout with params:', params)

    try {
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Creem API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('Creem checkout created successfully:', result.id)
      return result
    } catch (error) {
      console.error('Failed to create Creem checkout:', error)
      throw error
    }
  }

  /**
   * 获取产品信息
   */
  async getProduct(productId: string): Promise<CreemProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Creem API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get Creem product:', error)
      throw error
    }
  }

  /**
   * 验证Return URL签名
   */
  verifySignature(params: Record<string, string>, signature: string): boolean {
    // TODO: 实现Creem签名验证逻辑
    // 这需要根据Creem官方文档实现具体的签名验证算法
    console.log('Verifying Creem signature:', { params, signature })
    
    // 临时实现 - 生产环境需要实现真实的签名验证
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    
    // 生产环境的签名验证逻辑
    try {
      // 根据Creem文档实现签名验证
      // const expectedSignature = generateSignature(params, this.apiKey)
      // return signature === expectedSignature
      return true // 临时返回true
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }
}

// 创建服务实例
export const creemService = new CreemService(
  APP_CONFIG.creem.secretKey,
  process.env.NODE_ENV === 'development'
)

// Mock服务用于开发测试
export class MockCreemService extends CreemService {
  constructor() {
    super('mock_key', true)
  }

  async createCheckout(params: CreemCheckoutParams): Promise<CreemCheckoutResponse> {
    console.log('Mock Creem Checkout Create called with:', params)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    const checkoutId = `cs_mock_${Date.now()}`
    
    // 使用本地Mock支付页面而不是外部URL
    const mockUrl = new URL('/en/mock-payment', 'http://localhost:3000')
    mockUrl.searchParams.set('checkout_id', checkoutId)
    mockUrl.searchParams.set('product_id', params.product_id)
    if (params.customer_email) {
      mockUrl.searchParams.set('customer_email', params.customer_email)
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
      url: mockUrl.toString(),
      product_id: params.product_id,
      customer_email: params.customer_email,
      status: 'pending',
      created_at: new Date().toISOString()
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

// 根据环境选择服务实例
export const creem = process.env.NODE_ENV === 'development' && !APP_CONFIG.creem.secretKey
  ? new MockCreemService()
  : creemService
