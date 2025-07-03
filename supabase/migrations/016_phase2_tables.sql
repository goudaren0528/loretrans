-- =============================================
-- Phase 2 功能数据库表创建
-- 迁移文件: 016_phase2_tables.sql
-- 创建时间: 2025-01-03
-- 目标: 支持反馈系统、成就系统、分析系统
-- =============================================

-- =============================================
-- 1. 用户反馈表
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('rating', 'suggestion', 'bug', 'compliment')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  category VARCHAR(50),
  email VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at);

-- =============================================
-- 2. 翻译反馈表（快速反馈）
-- =============================================

CREATE TABLE IF NOT EXISTS public.translation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  translation_id UUID REFERENCES public.translations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR(20) DEFAULT 'quick' CHECK (feedback_type IN ('quick', 'detailed')),
  comment TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_translation_feedback_translation_id ON public.translation_feedback(translation_id);
CREATE INDEX IF NOT EXISTS idx_translation_feedback_user_id ON public.translation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_feedback_rating ON public.translation_feedback(rating);

-- =============================================
-- 3. 用户成就表
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON public.user_achievements(completed);
CREATE INDEX IF NOT EXISTS idx_user_achievements_claimed ON public.user_achievements(claimed);

-- =============================================
-- 4. 成就领取记录表
-- =============================================

CREATE TABLE IF NOT EXISTS public.achievement_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  credits_awarded INTEGER DEFAULT 0,
  other_rewards JSONB DEFAULT '{}'::jsonb,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_achievement_claims_user_id ON public.achievement_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_claims_achievement_id ON public.achievement_claims(achievement_id);

-- =============================================
-- 5. 分析指标表
-- =============================================

CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  metric_name VARCHAR(100) NOT NULL,
  metric_data JSONB NOT NULL,
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_id ON public.analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_session_id ON public.analytics_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON public.analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON public.analytics_metrics(timestamp);

-- =============================================
-- 6. 翻译性能统计表
-- =============================================

CREATE TABLE IF NOT EXISTS public.translation_performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  character_count INTEGER NOT NULL,
  translation_time INTEGER, -- 毫秒
  success BOOLEAN NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_translation_perf_user_id ON public.translation_performance_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_perf_languages ON public.translation_performance_stats(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_translation_perf_success ON public.translation_performance_stats(success);

-- =============================================
-- 7. 用户行为路径表
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  action_data JSONB DEFAULT '{}'::jsonb,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_journey_user_id ON public.user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_session_id ON public.user_journey_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_action ON public.user_journey_events(action);

-- =============================================
-- 8. 页面性能统计表
-- =============================================

CREATE TABLE IF NOT EXISTS public.page_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  dns_time INTEGER,
  tcp_time INTEGER,
  ssl_time INTEGER,
  ttfb INTEGER, -- Time to First Byte
  download_time INTEGER,
  dom_parse_time INTEGER,
  dom_ready_time INTEGER,
  load_complete_time INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_page_performance_url ON public.page_performance(url);
CREATE INDEX IF NOT EXISTS idx_page_performance_timestamp ON public.page_performance(timestamp);

-- =============================================
-- 9. JavaScript错误记录表
-- =============================================

CREATE TABLE IF NOT EXISTS public.javascript_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  filename TEXT,
  line_number INTEGER,
  column_number INTEGER,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_js_errors_user_id ON public.javascript_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_js_errors_message ON public.javascript_errors(error_message);
CREATE INDEX IF NOT EXISTS idx_js_errors_timestamp ON public.javascript_errors(timestamp);

-- =============================================
-- 10. 翻译错误记录表
-- =============================================

CREATE TABLE IF NOT EXISTS public.translation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_translation_errors_user_id ON public.translation_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_errors_type ON public.translation_errors(error_type);

-- =============================================
-- 11. 为翻译表添加质量统计字段
-- =============================================

DO $$
BEGIN
  -- 添加质量统计字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'translations' AND column_name = 'quality_stats') THEN
    ALTER TABLE public.translations ADD COLUMN quality_stats JSONB DEFAULT '{
      "good": 0,
      "bad": 0,
      "total": 0
    }'::jsonb;
  END IF;
  
  -- 添加质量评分字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'translations' AND column_name = 'quality_score') THEN
    ALTER TABLE public.translations ADD COLUMN quality_score DECIMAL(3,2);
  END IF;
END $$;

-- =============================================
-- 12. 创建成就进度更新函数
-- =============================================

CREATE OR REPLACE FUNCTION public.update_user_achievement(
  p_user_id UUID,
  p_achievement_id VARCHAR(100),
  p_progress INTEGER,
  p_target INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_progress INTEGER;
  is_completed BOOLEAN;
BEGIN
  -- 获取当前进度
  SELECT progress, completed INTO current_progress, is_completed
  FROM public.user_achievements
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  -- 如果记录不存在，创建新记录
  IF NOT FOUND THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, progress, completed, completed_at)
    VALUES (p_user_id, p_achievement_id, p_progress, p_progress >= p_target, 
            CASE WHEN p_progress >= p_target THEN NOW() ELSE NULL END);
    RETURN p_progress >= p_target;
  END IF;
  
  -- 如果已经完成，不需要更新
  IF is_completed THEN
    RETURN TRUE;
  END IF;
  
  -- 更新进度
  UPDATE public.user_achievements
  SET progress = GREATEST(current_progress, p_progress),
      completed = (GREATEST(current_progress, p_progress) >= p_target),
      completed_at = CASE 
        WHEN GREATEST(current_progress, p_progress) >= p_target THEN NOW() 
        ELSE completed_at 
      END,
      updated_at = NOW()
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  RETURN (GREATEST(current_progress, p_progress) >= p_target);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 13. 创建自动成就检查触发器
-- =============================================

CREATE OR REPLACE FUNCTION public.check_translation_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查翻译次数成就
  PERFORM public.update_user_achievement(
    NEW.user_id,
    'first_translation',
    1,
    1
  );
  
  -- 获取用户总翻译次数
  DECLARE
    total_translations INTEGER;
    total_characters INTEGER;
    unique_languages INTEGER;
  BEGIN
    SELECT COUNT(*), SUM(character_count)
    INTO total_translations, total_characters
    FROM public.translations
    WHERE user_id = NEW.user_id;
    
    -- 检查翻译次数成就
    PERFORM public.update_user_achievement(NEW.user_id, 'translation_novice', total_translations, 10);
    PERFORM public.update_user_achievement(NEW.user_id, 'translation_expert', total_translations, 100);
    PERFORM public.update_user_achievement(NEW.user_id, 'translation_master', total_translations, 1000);
    
    -- 检查字符数成就
    PERFORM public.update_user_achievement(NEW.user_id, 'character_milestone_10k', total_characters, 10000);
    PERFORM public.update_user_achievement(NEW.user_id, 'character_milestone_100k', total_characters, 100000);
    
    -- 检查多语言成就
    SELECT COUNT(DISTINCT source_language) + COUNT(DISTINCT target_language)
    INTO unique_languages
    FROM public.translations
    WHERE user_id = NEW.user_id;
    
    PERFORM public.update_user_achievement(NEW.user_id, 'polyglot_beginner', unique_languages, 3);
    PERFORM public.update_user_achievement(NEW.user_id, 'polyglot_expert', unique_languages, 6);
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_check_translation_achievements ON public.translations;
CREATE TRIGGER trigger_check_translation_achievements
  AFTER INSERT ON public.translations
  FOR EACH ROW EXECUTE FUNCTION public.check_translation_achievements();

-- =============================================
-- 14. 设置行级安全策略
-- =============================================

-- 用户反馈表策略
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 翻译反馈表策略
ALTER TABLE public.translation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own translation feedback" ON public.translation_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translation feedback" ON public.translation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 用户成就表策略
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage achievements" ON public.user_achievements
  FOR ALL USING (true); -- 系统函数需要完全访问权限

-- 成就领取记录表策略
ALTER TABLE public.achievement_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievement claims" ON public.achievement_claims
  FOR SELECT USING (auth.uid() = user_id);

-- 分析指标表策略（允许匿名插入）
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous analytics" ON public.analytics_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own analytics" ON public.analytics_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- =============================================
-- 15. 授予权限
-- =============================================

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION public.update_user_achievement(UUID, VARCHAR, INTEGER, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_translation_achievements() TO authenticated, service_role;

-- 授予表访问权限
GRANT SELECT, INSERT ON public.user_feedback TO authenticated, anon;
GRANT SELECT, INSERT ON public.translation_feedback TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.user_achievements TO authenticated, service_role;
GRANT SELECT, INSERT ON public.achievement_claims TO authenticated, service_role;
GRANT SELECT, INSERT ON public.analytics_metrics TO authenticated, anon;
GRANT SELECT, INSERT ON public.translation_performance_stats TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_journey_events TO authenticated, anon;
GRANT SELECT, INSERT ON public.page_performance TO authenticated, anon;
GRANT SELECT, INSERT ON public.javascript_errors TO authenticated, anon;
GRANT SELECT, INSERT ON public.translation_errors TO authenticated, anon;

-- =============================================
-- 16. 添加注释
-- =============================================

COMMENT ON TABLE public.user_feedback IS '用户反馈表，包含评分、建议、问题报告等';
COMMENT ON TABLE public.translation_feedback IS '翻译质量快速反馈表';
COMMENT ON TABLE public.user_achievements IS '用户成就进度表';
COMMENT ON TABLE public.achievement_claims IS '成就奖励领取记录表';
COMMENT ON TABLE public.analytics_metrics IS '用户行为分析指标表';
COMMENT ON TABLE public.translation_performance_stats IS '翻译性能统计表';
COMMENT ON TABLE public.user_journey_events IS '用户行为路径事件表';
COMMENT ON TABLE public.page_performance IS '页面性能统计表';
COMMENT ON TABLE public.javascript_errors IS 'JavaScript错误记录表';
COMMENT ON TABLE public.translation_errors IS '翻译错误记录表';

COMMENT ON FUNCTION public.update_user_achievement(UUID, VARCHAR, INTEGER, INTEGER) IS '更新用户成就进度';
COMMENT ON FUNCTION public.check_translation_achievements() IS '自动检查翻译相关成就的触发器函数';

-- =============================================
-- 完成迁移
-- =============================================

-- 记录迁移完成
INSERT INTO public.system_config (key, value, description)
VALUES ('migration_016_completed', to_jsonb(NOW()), 'Phase 2功能数据库表创建完成时间')
ON CONFLICT (key) DO UPDATE SET value = to_jsonb(NOW()), updated_at = NOW();
