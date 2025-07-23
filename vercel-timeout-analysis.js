#!/usr/bin/env node

/**
 * Vercel 30秒超时风险分析
 * 
 * 分析优化后的配置是否会触发Vercel单任务30秒限制
 */

// 优化后的配置
const OPTIMIZED_CONFIG = {
  MAX_CHUNK_SIZE: 800,
  BATCH_SIZE: 2,              // 每批2个块
  CONCURRENT_BATCHES: 2,      // 并发2个批次
  CHUNK_DELAY: 100,           // 块间延迟100ms
  BATCH_DELAY: 200,           // 批次间延迟200ms
  CONCURRENT_BATCH_DELAY: 500, // 并发组间延迟500ms
  QUEUE_THRESHOLD: 2000       // 队列阈值2000字符
};

// 计算处理时间的函数
function calculateProcessingTime(textLength, config) {
  const chunkCount = Math.ceil(textLength / config.MAX_CHUNK_SIZE);
  const batchCount = Math.ceil(chunkCount / config.BATCH_SIZE);
  const concurrentGroups = Math.ceil(batchCount / config.CONCURRENT_BATCHES);
  
  console.log(`\n📊 处理分析 (${textLength}字符):`);
  console.log(`  分块数量: ${chunkCount}个`);
  console.log(`  批次数量: ${batchCount}个`);
  console.log(`  并发组数: ${concurrentGroups}组`);
  
  // 每个块的翻译时间（API调用）
  const translationTimePerChunk = 5; // 5秒/块
  
  // 并发处理时间计算
  // 每组的处理时间 = 单个批次时间（因为批次并发执行）
  const timePerBatch = config.BATCH_SIZE * translationTimePerChunk + 
                      (config.BATCH_SIZE - 1) * (config.CHUNK_DELAY / 1000);
  
  const totalTranslationTime = concurrentGroups * timePerBatch;
  
  // 延迟时间
  const concurrentGroupDelay = (concurrentGroups - 1) * (config.CONCURRENT_BATCH_DELAY / 1000);
  
  // 总处理时间
  const totalTime = totalTranslationTime + concurrentGroupDelay;
  
  console.log(`  单批次时间: ${timePerBatch.toFixed(1)}秒`);
  console.log(`  翻译总时间: ${totalTranslationTime.toFixed(1)}秒`);
  console.log(`  延迟总时间: ${concurrentGroupDelay.toFixed(1)}秒`);
  console.log(`  总处理时间: ${totalTime.toFixed(1)}秒`);
  
  return {
    totalTime,
    chunkCount,
    batchCount,
    concurrentGroups,
    timePerBatch,
    translationTime: totalTranslationTime,
    delayTime: concurrentGroupDelay
  };
}

// Vercel超时风险评估
function assessVercelTimeout() {
  console.log('🔍 Vercel 30秒超时风险评估\n');
  console.log('⚠️  重要：Vercel Hobby计划单个函数执行限制为30秒');
  console.log('📋 分析基于以下假设：');
  console.log('  • 每个块翻译时间: 5秒（包含API调用和网络延迟）');
  console.log('  • 队列处理是异步的，不受30秒限制');
  console.log('  • 直接处理（非队列）受30秒限制\n');
  
  const testCases = [
    { length: 1000, desc: '短文本', useQueue: false },
    { length: 2000, desc: '队列阈值临界', useQueue: true },
    { length: 3000, desc: '中等文本', useQueue: true },
    { length: 5000, desc: '长文本', useQueue: true },
    { length: 10000, desc: '超长文本', useQueue: true }
  ];
  
  let riskFound = false;
  
  testCases.forEach(testCase => {
    console.log(`\n📝 ${testCase.desc} (${testCase.length}字符):`);
    
    const analysis = calculateProcessingTime(testCase.length, OPTIMIZED_CONFIG);
    const processingMethod = testCase.useQueue ? '队列处理（异步）' : '直接处理（同步）';
    
    console.log(`  处理方式: ${processingMethod}`);
    
    if (testCase.useQueue) {
      console.log(`  ✅ 队列处理 - 不受Vercel 30秒限制`);
      console.log(`  📤 API立即返回jobId，后台异步处理`);
    } else {
      const isSafe = analysis.totalTime <= 25; // 留5秒缓冲
      const status = isSafe ? '✅ 安全' : '❌ 超时风险';
      
      console.log(`  ${status} - 预计${analysis.totalTime.toFixed(1)}秒`);
      
      if (!isSafe) {
        riskFound = true;
        console.log(`  ⚠️  超出安全阈值25秒，存在超时风险`);
      }
    }
  });
  
  return !riskFound;
}

// 队列阈值合理性分析
function analyzeQueueThreshold() {
  console.log('\n🎯 队列阈值合理性分析\n');
  
  const threshold = OPTIMIZED_CONFIG.QUEUE_THRESHOLD;
  console.log(`当前队列阈值: ${threshold}字符`);
  
  // 计算阈值处的处理时间
  const thresholdAnalysis = calculateProcessingTime(threshold, OPTIMIZED_CONFIG);
  
  console.log(`\n📊 阈值处理时间分析:`);
  console.log(`  ${threshold}字符处理时间: ${thresholdAnalysis.totalTime.toFixed(1)}秒`);
  
  if (thresholdAnalysis.totalTime <= 25) {
    console.log(`  ✅ 阈值合理 - 处理时间在安全范围内`);
  } else {
    console.log(`  ⚠️  阈值可能过高 - 建议降低到避免超时`);
    
    // 计算安全阈值
    let safeThreshold = threshold;
    while (safeThreshold > 500) {
      safeThreshold -= 200;
      const testAnalysis = calculateProcessingTime(safeThreshold, OPTIMIZED_CONFIG);
      if (testAnalysis.totalTime <= 25) {
        console.log(`  💡 建议阈值: ${safeThreshold}字符 (处理时间: ${testAnalysis.totalTime.toFixed(1)}秒)`);
        break;
      }
    }
  }
}

// 实际场景模拟
function simulateRealScenarios() {
  console.log('\n🎬 实际场景模拟\n');
  
  const scenarios = [
    {
      name: '用户输入1500字符文章',
      length: 1500,
      expectation: '直接处理，快速返回'
    },
    {
      name: '用户输入3000字符文档',
      length: 3000,
      expectation: '队列处理，异步翻译'
    },
    {
      name: '用户输入10000字符长文',
      length: 10000,
      expectation: '队列处理，分批翻译'
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n📋 场景: ${scenario.name}`);
    console.log(`  文本长度: ${scenario.length}字符`);
    console.log(`  用户期望: ${scenario.expectation}`);
    
    const useQueue = scenario.length > OPTIMIZED_CONFIG.QUEUE_THRESHOLD;
    const analysis = calculateProcessingTime(scenario.length, OPTIMIZED_CONFIG);
    
    if (useQueue) {
      console.log(`  🔄 实际处理: 队列处理`);
      console.log(`  📤 API响应: 立即返回jobId (<1秒)`);
      console.log(`  ⏱️  后台处理: ${analysis.totalTime.toFixed(1)}秒`);
      console.log(`  ✅ Vercel限制: 不受影响`);
    } else {
      console.log(`  🔄 实际处理: 直接处理`);
      console.log(`  📤 API响应: ${analysis.totalTime.toFixed(1)}秒后返回结果`);
      
      const isSafe = analysis.totalTime <= 25;
      if (isSafe) {
        console.log(`  ✅ Vercel限制: 安全范围内`);
      } else {
        console.log(`  ❌ Vercel限制: 可能超时`);
        console.log(`  💡 建议: 降低队列阈值到${Math.floor(scenario.length * 0.8)}字符`);
      }
    }
  });
}

// 优化建议
function generateOptimizationSuggestions() {
  console.log('\n💡 优化建议\n');
  
  // 检查当前配置的安全性
  const criticalLength = OPTIMIZED_CONFIG.QUEUE_THRESHOLD;
  const criticalAnalysis = calculateProcessingTime(criticalLength, OPTIMIZED_CONFIG);
  
  if (criticalAnalysis.totalTime > 25) {
    console.log('⚠️  发现潜在风险：');
    console.log(`  当前队列阈值(${criticalLength}字符)的处理时间为${criticalAnalysis.totalTime.toFixed(1)}秒`);
    console.log(`  超过了Vercel安全阈值(25秒)`);
    console.log('\n🔧 建议修改：');
    
    // 计算安全阈值
    let safeThreshold = 1500;
    const safeAnalysis = calculateProcessingTime(safeThreshold, OPTIMIZED_CONFIG);
    console.log(`  1. 降低队列阈值到 ${safeThreshold}字符`);
    console.log(`     处理时间: ${safeAnalysis.totalTime.toFixed(1)}秒 ✅`);
    
    console.log(`  2. 或者进一步优化延迟配置：`);
    console.log(`     - 块间延迟: 100ms → 50ms`);
    console.log(`     - 并发组延迟: 500ms → 300ms`);
    
  } else {
    console.log('✅ 当前配置安全性良好');
    console.log(`  队列阈值处理时间: ${criticalAnalysis.totalTime.toFixed(1)}秒 < 25秒`);
  }
  
  console.log('\n📈 进一步优化建议：');
  console.log('  1. 监控实际API响应时间，动态调整预估时间');
  console.log('  2. 实施熔断机制，API响应慢时自动降级');
  console.log('  3. 添加缓存机制，减少重复翻译请求');
  console.log('  4. 考虑使用Vercel Pro计划，获得更长的执行时间限制');
}

// 主函数
function main() {
  console.log('🚀 Vercel 30秒超时风险分析\n');
  console.log('=' .repeat(60));
  
  // 1. 基础超时风险评估
  const isSafe = assessVercelTimeout();
  
  // 2. 队列阈值分析
  analyzeQueueThreshold();
  
  // 3. 实际场景模拟
  simulateRealScenarios();
  
  // 4. 优化建议
  generateOptimizationSuggestions();
  
  // 5. 总结
  console.log('\n' + '=' .repeat(60));
  console.log('📋 分析总结\n');
  
  if (isSafe) {
    console.log('✅ 总体评估: 当前配置相对安全');
    console.log('🎯 关键点: 队列处理避免了大部分超时风险');
    console.log('⚠️  注意: 仍需监控实际运行情况');
  } else {
    console.log('⚠️  总体评估: 存在超时风险');
    console.log('🔧 建议: 立即调整队列阈值或延迟配置');
  }
  
  console.log('\n🔄 下一步行动:');
  console.log('  1. 部署到Vercel测试环境');
  console.log('  2. 监控函数执行时间');
  console.log('  3. 根据实际表现调整参数');
  console.log('  4. 设置告警监控超时情况');
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = {
  calculateProcessingTime,
  assessVercelTimeout,
  OPTIMIZED_CONFIG
};
