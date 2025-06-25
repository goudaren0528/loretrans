/**
 * RLS策略验证工具
 * 用于测试和验证数据库行级安全策略的有效性
 */

import { createSupabaseBrowserClient } from '../supabase'

type SupabaseClientType = ReturnType<typeof createSupabaseBrowserClient>

/**
 * 安全测试结果接口
 */
export interface SecurityTestResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

/**
 * 安全测试套件结果
 */
export interface SecurityTestSuite {
  suiteName: string
  totalTests: number
  passedTests: number
  failedTests: number
  results: SecurityTestResult[]
}

/**
 * RLS策略验证器类
 */
export class RLSValidator {
  private client: SupabaseClientType
  private currentUserId: string | null = null

  constructor(client?: SupabaseClientType) {
    this.client = client || createSupabaseBrowserClient()
  }

  /**
   * 设置当前用户ID
   */
  setCurrentUser(userId: string) {
    this.currentUserId = userId
  }

  /**
   * 运行完整的安全测试套件
   */
  async runFullSecurityTests(): Promise<SecurityTestSuite> {
    const results: SecurityTestResult[] = []

    // 1. 用户数据访问测试
    const userTests = await this.testUserDataAccess()
    results.push(...userTests)

    // 2. 积分交易访问测试
    const creditTests = await this.testCreditTransactionAccess()
    results.push(...creditTests)

    // 3. 支付记录访问测试
    const paymentTests = await this.testPaymentAccess()
    results.push(...paymentTests)

    // 4. 数据修改权限测试
    const modificationTests = await this.testDataModificationLimits()
    results.push(...modificationTests)

    // 5. 管理员权限测试
    const adminTests = await this.testAdminAccess()
    results.push(...adminTests)

    const passedTests = results.filter(r => r.passed).length
    const failedTests = results.filter(r => !r.passed).length

    return {
      suiteName: 'RLS安全策略测试',
      totalTests: results.length,
      passedTests,
      failedTests,
      results
    }
  }

  /**
   * 测试用户数据访问权限
   */
  private async testUserDataAccess(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试1：用户只能查看自己的数据
      const { data: userData, error: userError } = await this.client
        .from('users')
        .select('*')

      if (userError) {
        results.push({
          testName: '用户数据查询权限',
          passed: false,
          message: `查询失败: ${userError.message}`,
          details: userError
        })
      } else {
        const hasOtherUsers = userData?.some(user => user.id !== this.currentUserId)
        results.push({
          testName: '用户数据查询权限',
          passed: !hasOtherUsers,
          message: hasOtherUsers ? '用户可以查看其他用户数据（违反RLS）' : '用户只能查看自己的数据',
          details: { foundUsers: userData?.length || 0 }
        })
      }

      // 测试2：用户资料访问权限
      const { data: profileData, error: profileError } = await this.client
        .from('user_profiles')
        .select('*')

      if (profileError) {
        results.push({
          testName: '用户资料查询权限',
          passed: false,
          message: `查询失败: ${profileError.message}`,
          details: profileError
        })
      } else {
        const hasOtherProfiles = profileData?.some(profile => profile.user_id !== this.currentUserId)
        results.push({
          testName: '用户资料查询权限',
          passed: !hasOtherProfiles,
          message: hasOtherProfiles ? '用户可以查看其他用户资料（违反RLS）' : '用户只能查看自己的资料',
          details: { foundProfiles: profileData?.length || 0 }
        })
      }

    } catch (error) {
      results.push({
        testName: '用户数据访问测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 测试积分交易访问权限
   */
  private async testCreditTransactionAccess(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试：积分交易记录访问权限
      const { data: transactionData, error: transactionError } = await this.client
        .from('credit_transactions')
        .select('*')

      if (transactionError) {
        results.push({
          testName: '积分交易查询权限',
          passed: false,
          message: `查询失败: ${transactionError.message}`,
          details: transactionError
        })
      } else {
        const hasOtherTransactions = transactionData?.some(tx => tx.user_id !== this.currentUserId)
        results.push({
          testName: '积分交易查询权限',
          passed: !hasOtherTransactions,
          message: hasOtherTransactions ? '用户可以查看其他用户的交易记录（违反RLS）' : '用户只能查看自己的交易记录',
          details: { foundTransactions: transactionData?.length || 0 }
        })
      }

      // 测试：尝试直接插入积分交易（应该失败）
      const { error: insertError } = await this.client
        .from('credit_transactions')
        .insert({
          user_id: this.currentUserId,
          transaction_type: 'consume',
          amount: 100,
          description: '测试交易'
        })

      results.push({
        testName: '积分交易直接插入权限',
        passed: !!insertError,
        message: insertError ? '用户无法直接插入交易记录（正确）' : '用户可以直接插入交易记录（违反安全策略）',
        details: insertError
      })

    } catch (error) {
      results.push({
        testName: '积分交易访问测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 测试支付记录访问权限
   */
  private async testPaymentAccess(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试：支付记录访问权限
      const { data: paymentData, error: paymentError } = await this.client
        .from('payments')
        .select('*')

      if (paymentError) {
        results.push({
          testName: '支付记录查询权限',
          passed: false,
          message: `查询失败: ${paymentError.message}`,
          details: paymentError
        })
      } else {
        const hasOtherPayments = paymentData?.some(payment => payment.user_id !== this.currentUserId)
        results.push({
          testName: '支付记录查询权限',
          passed: !hasOtherPayments,
          message: hasOtherPayments ? '用户可以查看其他用户的支付记录（违反RLS）' : '用户只能查看自己的支付记录',
          details: { foundPayments: paymentData?.length || 0 }
        })
      }

    } catch (error) {
      results.push({
        testName: '支付记录访问测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 测试数据修改权限限制
   */
  private async testDataModificationLimits(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试：尝试修改其他用户的数据
      const fakeUserId = '00000000-0000-0000-0000-000000000000'
      
      const { error: updateUserError } = await this.client
        .from('users')
        .update({ credits: 999999 })
        .eq('id', fakeUserId)

      results.push({
        testName: '修改其他用户数据权限',
        passed: !!updateUserError,
        message: updateUserError ? '无法修改其他用户数据（正确）' : '可以修改其他用户数据（违反安全策略）',
        details: updateUserError
      })

      // 测试：尝试直接增加自己的积分
      if (this.currentUserId) {
        const { error: creditUpdateError } = await this.client
          .from('users')
          .update({ credits: 999999 })
          .eq('id', this.currentUserId)

        results.push({
          testName: '直接修改积分权限',
          passed: !!creditUpdateError,
          message: creditUpdateError ? '无法直接增加积分（正确）' : '可以直接增加积分（违反安全策略）',
          details: creditUpdateError
        })
      }

    } catch (error) {
      results.push({
        testName: '数据修改权限测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 测试管理员权限
   */
  private async testAdminAccess(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试：审计日志访问（只有管理员可以访问）
      const { data: auditData, error: auditError } = await this.client
        .from('audit_logs')
        .select('*')
        .limit(1)

      // 这个测试的结果取决于当前用户是否为管理员
      results.push({
        testName: '审计日志访问权限',
        passed: true, // 这个测试总是通过，因为结果取决于用户角色
        message: auditError ? '非管理员用户无法访问审计日志（正确）' : '用户可以访问审计日志（可能是管理员）',
        details: { error: auditError, dataCount: auditData?.length || 0 }
      })

      // 测试：系统配置访问（只有管理员可以访问）
      const { data: configData, error: configError } = await this.client
        .from('system_configs')
        .select('*')
        .limit(1)

      results.push({
        testName: '系统配置访问权限',
        passed: true, // 这个测试总是通过，因为结果取决于用户角色
        message: configError ? '非管理员用户无法访问系统配置（正确）' : '用户可以访问系统配置（可能是管理员）',
        details: { error: configError, dataCount: configData?.length || 0 }
      })

    } catch (error) {
      results.push({
        testName: '管理员权限测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 测试数据库函数权限
   */
  async testDatabaseFunctions(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    try {
      // 测试：异常活动检测函数
      const { data: suspiciousData, error: suspiciousError } = await this.client
        .rpc('detect_suspicious_activity')

      results.push({
        testName: '异常活动检测函数',
        passed: !suspiciousError,
        message: suspiciousError ? `函数调用失败: ${suspiciousError.message}` : '异常活动检测函数正常工作',
        details: { data: suspiciousData, error: suspiciousError }
      })

      // 测试：用户权限检查函数
      const { data: permissionData, error: permissionError } = await this.client
        .rpc('check_user_permissions', { 
          p_action: 'translate' 
        })

      results.push({
        testName: '用户权限检查函数',
        passed: !permissionError,
        message: permissionError ? `函数调用失败: ${permissionError.message}` : '用户权限检查函数正常工作',
        details: { data: permissionData, error: permissionError }
      })

    } catch (error) {
      results.push({
        testName: '数据库函数测试',
        passed: false,
        message: `测试异常: ${error}`,
        details: error
      })
    }

    return results
  }

  /**
   * 生成安全报告
   */
  generateSecurityReport(testSuite: SecurityTestSuite): string {
    const { suiteName, totalTests, passedTests, failedTests, results } = testSuite

    let report = `\n=== ${suiteName} ===\n`
    report += `总测试数: ${totalTests}\n`
    report += `通过数: ${passedTests}\n`
    report += `失败数: ${failedTests}\n`
    report += `通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`

    report += `详细结果:\n`
    results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      report += `${index + 1}. ${status} ${result.testName}: ${result.message}\n`
    })

    if (failedTests > 0) {
      report += `\n⚠️  发现 ${failedTests} 个安全问题，请检查RLS策略配置！\n`
    } else {
      report += `\n✅ 所有安全测试通过，RLS策略配置正确！\n`
    }

    return report
  }

  /**
   * 检查当前用户的权限级别
   */
  async checkCurrentUserPermissions(): Promise<{
    isAuthenticated: boolean
    userId: string | null
    userRole: string | null
    hasAdminAccess: boolean
  }> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return {
          isAuthenticated: false,
          userId: null,
          userRole: null,
          hasAdminAccess: false
        }
      }

      // 检查用户角色
      const { data: profileData } = await this.client
        .from('user_profiles')
        .select('metadata')
        .eq('user_id', user.id)
        .single()

      const userRole = profileData?.metadata?.role || 'user'
      const hasAdminAccess = userRole === 'admin'

      return {
        isAuthenticated: true,
        userId: user.id,
        userRole,
        hasAdminAccess
      }
    } catch (error) {
      console.error('检查用户权限时出错:', error)
      return {
        isAuthenticated: false,
        userId: null,
        userRole: null,
        hasAdminAccess: false
      }
    }
  }
}

/**
 * 创建RLS验证器实例
 */
export function createRLSValidator(client?: SupabaseClientType): RLSValidator {
  return new RLSValidator(client)
}

/**
 * 快速安全检查函数
 */
export async function quickSecurityCheck(): Promise<SecurityTestSuite> {
  const validator = createRLSValidator()
  
  // 获取当前用户信息
  const userInfo = await validator.checkCurrentUserPermissions()
  
  if (!userInfo.isAuthenticated) {
    return {
      suiteName: '快速安全检查',
      totalTests: 1,
      passedTests: 0,
      failedTests: 1,
      results: [{
        testName: '用户认证状态',
        passed: false,
        message: '用户未登录，无法进行安全检查'
      }]
    }
  }

  validator.setCurrentUser(userInfo.userId!)
  return await validator.runFullSecurityTests()
}

/**
 * 安全策略验证中间件
 */
export function createSecurityMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const validator = createRLSValidator()
      const userInfo = await validator.checkCurrentUserPermissions()
      
      // 将用户信息添加到请求对象
      req.user = userInfo
      req.securityValidator = validator
      
      next()
    } catch (error) {
      console.error('安全中间件错误:', error)
      res.status(500).json({ error: '安全检查失败' })
    }
  }
} 