import type { UserRole } from '../shared/types'

type Role = UserRole | 'guest'

interface PathConfig {
  path: string | RegExp
  roles: Role[]
}

export const permissionsConfig: PathConfig[] = [
  // 管理后台，只允许 admin 访问
  {
    path: /^\/admin(\/.*)?$/,
    roles: ['admin'],
  },
  // 用户仪表盘，至少需要是 free_user
  {
    path: /^\/dashboard(\/.*)?$/,
    roles: ['free_user', 'pro_user', 'admin'],
  },
  // 个人资料设置
  {
    path: /^\/settings(\/.*)?$/,
    roles: ['free_user', 'pro_user', 'admin'],
  },
  // 文档翻译页面，至少需要是 free_user
  {
    path: '/document-translate',
    roles: ['free_user', 'pro_user', 'admin'],
  },
  // 支付/购买积分页面，至少需要是 free_user
  {
    path: '/purchase',
    roles: ['free_user', 'pro_user', 'admin'],
  },
]

// 默认重定向路径
export const REDIRECT_MAP: Record<string, string> = {
  default: '/auth/signin', // 默认重定向到登录页
  auth: '/', // 如果已登录用户访问登录页，重定向到主页
  unauthorized: '/unauthorized', // 权限不足时重定向
} 