const axios = require('axios')

class NLLBServiceTester {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl
    this.testCases = [
      { text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'ht', expected: '克里奥尔语' },
      { text: 'Good morning', sourceLanguage: 'en', targetLanguage: 'sw', expected: '斯瓦希里语' },
      { text: 'Thank you', sourceLanguage: 'en', targetLanguage: 'lo', expected: '老挝语' }
    ]
  }

  async testHealthCheck() {
    console.log('🔍 Testing health check...')
    try {
      const response = await axios.get(`${this.baseUrl}/health`)
      console.log('✅ Health check passed:', response.data)
      return true
    } catch (error) {
      console.error('❌ Health check failed:', error.message)
      return false
    }
  }

  async testSingleTranslation() {
    console.log('🔍 Testing single translation...')
    const testCase = this.testCases[0]
    
    try {
      const response = await axios.post(`${this.baseUrl}/translate`, testCase)
      console.log('✅ Single translation passed:')
      console.log(`  Input: "${testCase.text}" (${testCase.sourceLanguage})`)
      console.log(`  Output: "${response.data.translatedText}" (${testCase.targetLanguage})`)
      console.log(`  Processing time: ${response.data.processingTime}ms`)
      return true
    } catch (error) {
      console.error('❌ Single translation failed:', error.response?.data || error.message)
      return false
    }
  }

  async testBatchTranslation() {
    console.log('🔍 Testing batch translation...')
    
    const batchRequest = {
      texts: this.testCases.slice(0, 2).map(tc => tc.text),
      sourceLanguage: 'en',
      targetLanguage: 'ht'
    }
    
    try {
      const response = await axios.post(`${this.baseUrl}/translate/batch`, batchRequest)
      console.log('✅ Batch translation passed:')
      console.log(`  Translated ${response.data.results.length} texts`)
      console.log(`  Processing time: ${response.data.processingTime}ms`)
      
      response.data.results.forEach((result, index) => {
        console.log(`  [${index + 1}] "${batchRequest.texts[index]}" -> "${result.translatedText}"`)
      })
      
      return true
    } catch (error) {
      console.error('❌ Batch translation failed:', error.response?.data || error.message)
      return false
    }
  }

  async testLanguageSupport() {
    console.log('🔍 Testing language support...')
    
    try {
      const response = await axios.get(`${this.baseUrl}/languages`)
      console.log('✅ Language support check passed:')
      console.log(`  Total supported languages: ${response.data.total}`)
      console.log('  Supported languages:', Object.keys(response.data.supported).join(', '))
      return true
    } catch (error) {
      console.error('❌ Language support check failed:', error.response?.data || error.message)
      return false
    }
  }

  async testModelInfo() {
    console.log('🔍 Testing model info...')
    
    try {
      const response = await axios.get(`${this.baseUrl}/model/info`)
      console.log('✅ Model info check passed:')
      console.log(`  Model: ${response.data.model}`)
      console.log(`  Loaded: ${response.data.loaded}`)
      console.log(`  Supported languages: ${response.data.supportedLanguages}`)
      return true
    } catch (error) {
      console.error('❌ Model info check failed:', error.response?.data || error.message)
      return false
    }
  }

  async runAllTests() {
    console.log('🧪 Starting NLLB Service Tests...')
    console.log(`   Service URL: ${this.baseUrl}`)
    console.log('─'.repeat(50))

    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Model Info', fn: () => this.testModelInfo() },
      { name: 'Language Support', fn: () => this.testLanguageSupport() },
      { name: 'Single Translation', fn: () => this.testSingleTranslation() },
      { name: 'Batch Translation', fn: () => this.testBatchTranslation() }
    ]

    let passed = 0
    let failed = 0

    for (const test of tests) {
      try {
        const result = await test.fn()
        if (result) {
          passed++
        } else {
          failed++
        }
      } catch (error) {
        console.error(`❌ Test "${test.name}" crashed:`, error.message)
        failed++
      }
      console.log('─'.repeat(50))
    }

    console.log('📊 Test Results:')
    console.log(`   ✅ Passed: ${passed}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📈 Success Rate: ${Math.round(passed / (passed + failed) * 100)}%`)

    return failed === 0
  }
}

// 命令行运行
async function main() {
  const serviceUrl = process.argv[2] || 'http://localhost:8080'
  const tester = new NLLBServiceTester(serviceUrl)
  
  try {
    const success = await tester.runAllTests()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('Test runner failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = NLLBServiceTester 