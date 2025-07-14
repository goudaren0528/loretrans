// 环境变量检查器 - 用于调试部署问题
export function checkSupabaseEnv() {
  const vars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  
  console.log('🔍 环境变量状态:');
  Object.entries(vars).forEach(([key, value]) => {
    console.log(`${key}: ${value ? 'SET' : 'MISSING'}`);
  });
  
  const missing = Object.entries(vars)
    .filter(([key, value]) => !value && key !== 'SUPABASE_SERVICE_ROLE_KEY')
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.error('❌ 缺少环境变量:', missing);
    return false;
  }
  
  console.log('✅ 所有必需的环境变量都已设置');
  return true;
}