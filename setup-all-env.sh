#!/bin/bash
# Vercel环境变量完整配置脚本
echo "🚀 配置所有Vercel环境变量..."
echo ""

echo "设置 ECR_REGISTRY..."
vercel env add ECR_REGISTRY production <<< "034986963036.dkr.ecr.ap-southeast-1.amazonaws.com"
echo ""

echo "设置 ECR_REPOSITORY..."
vercel env add ECR_REPOSITORY production <<< "looplay"
echo ""

echo "设置 AWS_REGION..."
vercel env add AWS_REGION production <<< "ap-southeast-1"
echo ""

echo "设置 NLLB_SERVICE_PORT..."
vercel env add NLLB_SERVICE_PORT production <<< "8080"
echo ""

echo "设置 FILE_PROCESSOR_PORT..."
vercel env add FILE_PROCESSOR_PORT production <<< "8081"
echo ""

echo "设置 REDIS_PORT..."
vercel env add REDIS_PORT production <<< "6379"
echo ""

echo "设置 NGINX_HTTP_PORT..."
vercel env add NGINX_HTTP_PORT production <<< "80"
echo ""

echo "设置 NGINX_HTTPS_PORT..."
vercel env add NGINX_HTTPS_PORT production <<< "443"
echo ""

echo "设置 NLLB_BATCH_SIZE..."
vercel env add NLLB_BATCH_SIZE production <<< "4"
echo ""

echo "设置 NLLB_MAX_CONCURRENT..."
vercel env add NLLB_MAX_CONCURRENT production <<< "5"
echo ""

echo "设置 FILE_PROCESSOR_CONCURRENCY..."
vercel env add FILE_PROCESSOR_CONCURRENCY production <<< "3"
echo ""

echo "设置 NLLB_MEMORY_LIMIT..."
vercel env add NLLB_MEMORY_LIMIT production <<< "6G"
echo ""

echo "设置 NLLB_CPU_LIMIT..."
vercel env add NLLB_CPU_LIMIT production <<< "4.0"
echo ""

echo "设置 FILE_PROCESSOR_MEMORY_LIMIT..."
vercel env add FILE_PROCESSOR_MEMORY_LIMIT production <<< "2G"
echo ""

echo "设置 FILE_PROCESSOR_CPU_LIMIT..."
vercel env add FILE_PROCESSOR_CPU_LIMIT production <<< "2.0"
echo ""

echo "设置 REDIS_MEMORY_LIMIT..."
vercel env add REDIS_MEMORY_LIMIT production <<< "1G"
echo ""

echo "设置 LOG_LEVEL..."
vercel env add LOG_LEVEL production <<< "info"
echo ""

echo "设置 ENABLE_MONITORING..."
vercel env add ENABLE_MONITORING production <<< "false"
echo ""

echo "设置 PROMETHEUS_PORT..."
vercel env add PROMETHEUS_PORT production <<< "9090"
echo ""

echo "设置 GRAFANA_PORT..."
vercel env add GRAFANA_PORT production <<< "3001"
echo ""

echo "设置 NLLB_SERVICE_URL..."
vercel env add NLLB_SERVICE_URL production <<< "https://wane0528-my-nllb-api.hf.space/api/v4/translator"
echo ""

echo "设置 NLLB_SERVICE_TIMEOUT..."
vercel env add NLLB_SERVICE_TIMEOUT production <<< "60000"
echo ""

echo "设置 NLLB_BACKUP_URL..."
vercel env add NLLB_BACKUP_URL production <<< "https://huggingface.co/spaces/facebook/nllb-translation"
echo ""

echo "设置 NLLB_BACKUP_TIMEOUT..."
vercel env add NLLB_BACKUP_TIMEOUT production <<< "45000"
echo ""

echo "设置 TRANSLATION_MAX_RETRIES..."
vercel env add TRANSLATION_MAX_RETRIES production <<< "3"
echo ""

echo "设置 TRANSLATION_RETRY_DELAY..."
vercel env add TRANSLATION_RETRY_DELAY production <<< "1000"
echo ""

echo "设置 TRANSLATION_FREE_LIMIT..."
vercel env add TRANSLATION_FREE_LIMIT production <<< "1000"
echo ""

echo "设置 USE_MOCK_TRANSLATION..."
vercel env add USE_MOCK_TRANSLATION production <<< "false"
echo ""

echo "设置 ENABLE_TRANSLATION_FALLBACK..."
vercel env add ENABLE_TRANSLATION_FALLBACK production <<< "true"
echo ""

echo "设置 ENABLE_DICTIONARY_FALLBACK..."
vercel env add ENABLE_DICTIONARY_FALLBACK production <<< "true"
echo ""

echo "设置 ENABLE_DETAILED_LOGGING..."
vercel env add ENABLE_DETAILED_LOGGING production <<< "true"
echo ""

echo "设置 ENABLE_HEALTH_CHECK..."
vercel env add ENABLE_HEALTH_CHECK production <<< "true"
echo ""

echo "设置 HEALTH_CHECK_INTERVAL..."
vercel env add HEALTH_CHECK_INTERVAL production <<< "300000"
echo ""

echo "设置 FILE_MAX_SIZE..."
vercel env add FILE_MAX_SIZE production <<< "52428800"
echo ""

echo "设置 FILE_MAX_PAGES..."
vercel env add FILE_MAX_PAGES production <<< "100"
echo ""

echo "设置 CREDIT_PRICE_PER_1000..."
vercel env add CREDIT_PRICE_PER_1000 production <<< "0.10"
echo ""

echo "设置 FREE_CREDITS_PER_USER..."
vercel env add FREE_CREDITS_PER_USER production <<< "1000"
echo ""

echo "设置 MAX_CREDITS_PER_PURCHASE..."
vercel env add MAX_CREDITS_PER_PURCHASE production <<< "100000"
echo ""

echo "设置 MAX_TEXT_LENGTH..."
vercel env add MAX_TEXT_LENGTH production <<< "5000"
echo ""

echo "设置 MAX_DOCUMENT_SIZE..."
vercel env add MAX_DOCUMENT_SIZE production <<< "52428800"
echo ""

echo "设置 MAX_TRANSLATIONS_PER_HOUR..."
vercel env add MAX_TRANSLATIONS_PER_HOUR production <<< "100"
echo ""

echo "设置 MAX_API_CALLS_PER_DAY..."
vercel env add MAX_API_CALLS_PER_DAY production <<< "1000"
echo ""

echo "设置 CREEM_API_KEY..."
vercel env add CREEM_API_KEY production <<< "creem_1dgd7XA8MmfIo7aqLeO13S"
echo ""

echo "设置 CREEM_WEBHOOK_SECRET..."
vercel env add CREEM_WEBHOOK_SECRET production <<< "whsec_5U9Hb72vZdb3t2s8DtETmK"
echo ""

echo "设置 NEXT_PUBLIC_SUPABASE_URL..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://crhchsvaesipbifykbnp.supabase.co"
echo ""

echo "设置 NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o"
echo ""

echo "设置 SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyOTEyNCwiZXhwIjoyMDY1MjA1MTI0fQ.MzmkGXEe8vIrGaW9S0SqfbrUq3kmtu4Q9Piv2rlYK0I"
echo ""

echo "✅ 所有环境变量配置完成!"
echo ""
echo "📋 检查配置结果:"
vercel env ls
echo ""
echo "🚀 重新部署:"
vercel --prod
