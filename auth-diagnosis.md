# Supabase 认证问题诊断

## 发现的问题：
1. `public.user_stats` 视图使用了 SECURITY DEFINER
2. 多个函数有 role mutable search_path 问题
3. HaveIBeenPwned 密码检查未启用
4. MFA 选项太少

## 需要在 Supabase 控制台检查的设置：

### Authentication → Settings
1. **Enable email confirmations**: 建议暂时禁用以简化测试
2. **Enable phone confirmations**: 确保禁用
3. **Password requirements**: 检查是否有过于严格的要求
4. **HaveIBeenPwned integration**: 暂时禁用以排除密码检查问题

### Database → Functions
1. 检查是否有触发器错误
2. 查看函数执行日志

### 建议的临时配置（用于测试）：
- 禁用邮箱确认
- 禁用密码复杂度检查
- 禁用 HaveIBeenPwned 检查
- 简化认证流程

## 下一步行动：
1. 在控制台中调整这些设置
2. 重新测试认证
3. 如果仍然失败，考虑重新创建项目
