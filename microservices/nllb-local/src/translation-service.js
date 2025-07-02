const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// Mock NLLB Translation Service for Development
class NLLBTranslationService {
  constructor() {
    this.modelLoaded = false
    this.modelPath = path.join(__dirname, '../models/nllb-600m')
    this.pythonScript = path.join(__dirname, '../scripts/translate.py')
    this.batchSize = parseInt(process.env.BATCH_SIZE || '4')
    
    // NLLB语言代码映射
    this.languageMap = {
      'ht': 'hat_Latn', // Haitian Creole
      'lo': 'lao_Laoo', // Lao
      'sw': 'swh_Latn', // Swahili
      'my': 'mya_Mymr', // Burmese
      'te': 'tel_Telu', // Telugu
      'si': 'sin_Sinh', // Sinhala
      'am': 'amh_Ethi', // Amharic
      'km': 'khm_Khmr', // Khmer
      'ne': 'npi_Deva', // Nepali
      'mg': 'plt_Latn', // Malagasy
      'en': 'eng_Latn', // English
      'zh': 'zho_Hans', // Chinese (Simplified)
      'fr': 'fra_Latn', // French
      'es': 'spa_Latn', // Spanish
      'pt': 'por_Latn', // Portuguese
      'ar': 'arb_Arab', // Arabic
    }

    // Mock翻译字典
    this.mockTranslations = {
      'en-ht': {
        'Hello': 'Bonjou',
        'Hello world': 'Bonjou monn',
        'Good morning': 'Bonjou',
        'Thank you': 'Mèsi',
        'How are you?': 'Kijan ou ye?',
        'Goodbye': 'Orevwa'
      },
      'en-sw': {
        'Hello': 'Hujambo',
        'Hello world': 'Hujambo dunia',
        'Good morning': 'Habari za asubuhi',
        'Thank you': 'Asante',
        'How are you?': 'Habari yako?',
        'Goodbye': 'Kwaheri'
      },
      'en-lo': {
        'Hello': 'ສະບາຍດີ',
        'Hello world': 'ສະບາຍດີໂລກ',
        'Good morning': 'ສະບາຍດີຕອນເຊົ້າ',
        'Thank you': 'ຂອບໃຈ',
        'How are you?': 'ສະບາຍດີບໍ?',
        'Goodbye': 'ລາກ່ອນ'
      },
      'en-my': {
        'Hello': 'မင်္ဂလာပါ',
        'Hello world': 'မင်္ဂလာပါ ကမ္ဘာ',
        'Good morning': 'မင်္ဂလာပါ',
        'Thank you': 'ကျေးဇူးတင်ပါတယ်',
        'How are you?': 'နေကောင်းလား?',
        'Goodbye': 'သွားတော့မယ်'
      }
    }
  }

  /**
   * 初始化服务
   */
  async initialize() {
    console.log('Initializing NLLB Translation Service...')
    
    try {
      // 检查模型是否存在
      if (!fs.existsSync(this.modelPath)) {
        console.log('❌ Model not found. Please download the model first:')
        console.log('   npm run download-model')
        throw new Error('Model not found')
      }

      // 创建Python翻译脚本
      await this.createPythonScript()
      
      // 测试Python环境
      await this.checkPythonEnvironment()
      
      this.modelLoaded = true
      console.log('✅ NLLB Translation Service initialized successfully!')
      
      // 预热模型
      await this.warmupModel()
      
    } catch (error) {
      console.error('Failed to initialize NLLB service:', error)
      throw error
    }
  }

  /**
   * 创建Python翻译脚本
   */
  async createPythonScript() {
    const scriptContent = `#!/usr/bin/env python3
import sys
import json
import os
from pathlib import Path

# 添加模型路径
model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

class NLLBTranslator:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_model(self):
        if self.model is None:
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
                self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
                self.model.to(self.device)
                return True
            except Exception as e:
                print(json.dumps({"error": f"Failed to load model: {e}"}))
                return False
        return True
    
    def translate(self, text, src_lang, tgt_lang):
        if not self.load_model():
            return None
            
        try:
            # 设置源语言 - 这是NLLB正确翻译的关键
            self.tokenizer.src_lang = src_lang
            
            # 编码输入文本 - 增加长度限制
            inputs = self.tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 获取目标语言的token ID
            tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
            
            # 生成翻译 - 强制完整翻译参数
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_new_tokens=512,  # 使用max_new_tokens而不是max_length
                    min_length=20,  # 增加最小长度
                    num_beams=4,
                    length_penalty=0.0,  # 完全移除长度惩罚
                    early_stopping=False,  # 禁用早停
                    no_repeat_ngram_size=3,  # 避免重复
                    do_sample=False,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    forced_eos_token_id=None  # 不强制结束
                )
            
            # 解码结果
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return result
            
        except Exception as e:
            print(json.dumps({"error": f"Translation failed: {e}"}))
            return None

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python translate.py <text> <src_lang> <tgt_lang>"}))
        sys.exit(1)
    
    text = sys.argv[1]
    src_lang = sys.argv[2]  
    tgt_lang = sys.argv[3]
    
    translator = NLLBTranslator()
    result = translator.translate(text, src_lang, tgt_lang)
    
    if result:
        print(json.dumps({"translatedText": result}))
    else:
        print(json.dumps({"error": "Translation failed"}))

if __name__ == "__main__":
    main()
`

    const scriptDir = path.dirname(this.pythonScript)
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true })
    }
    
    fs.writeFileSync(this.pythonScript, scriptContent)
  }

  /**
   * 检查Python环境
   */
  async checkPythonEnvironment() {
    return new Promise((resolve, reject) => {
      const python = spawn('python', ['--version'])
      
      python.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python environment available')
          resolve()
        } else {
          reject(new Error('Python not found. Please install Python 3.7+'))
        }
      })
      
      python.on('error', (error) => {
        reject(new Error('Python not found. Please install Python 3.7+'))
      })
    })
  }

  /**
   * 预热模型
   */
  async warmupModel() {
    console.log('Warming up NLLB model...')
    try {
      await this.translateText('Hello world', 'en', 'ht')
      console.log('✅ Model warmup completed!')
    } catch (error) {
      console.warn('⚠️  Model warmup failed:', error.message)
    }
  }

  /**
   * 获取NLLB语言代码
   */
  getNLLBLanguageCode(language) {
    const nllbCode = this.languageMap[language]
    if (!nllbCode) {
      throw new Error(`Unsupported language: ${language}`)
    }
    return nllbCode
  }

  /**
   * 翻译单个文本
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!this.modelLoaded) {
      throw new Error('Model not loaded')
    }

    try {
      const sourceCode = this.getNLLBLanguageCode(sourceLanguage)
      const targetCode = this.getNLLBLanguageCode(targetLanguage)

      console.log('=== NLLB TRANSLATION SERVICE ===')
      console.log(`Input text length: ${text.length}`)
      console.log(`Input text: "${text}"`)
      console.log(`Language mapping: ${sourceLanguage} (${sourceCode}) -> ${targetLanguage} (${targetCode})`)

      return new Promise((resolve, reject) => {
        const python = spawn('python', [this.pythonScript, text, sourceCode, targetCode])
        
        let output = ''
        let error = ''
        
        python.stdout.on('data', (data) => {
          const chunk = data.toString()
          output += chunk
          console.log(`Python stdout: ${chunk}`)
        })
        
        python.stderr.on('data', (data) => {
          const chunk = data.toString()
          error += chunk
          console.log(`Python stderr: ${chunk}`)
        })
        
        python.on('close', (code) => {
          console.log(`=== PYTHON PROCESS COMPLETED ===`)
          console.log(`Exit code: ${code}`)
          console.log(`Full stdout: ${output}`)
          console.log(`Full stderr: ${error}`)
          
          if (code === 0) {
            try {
              const result = JSON.parse(output.trim())
              if (result.error) {
                console.log(`Python script error: ${result.error}`)
                reject(new Error(result.error))
              } else {
                console.log(`=== TRANSLATION SUCCESS ===`)
                console.log(`Translated text length: ${result.translatedText.length}`)
                console.log(`Translated text: "${result.translatedText}"`)
                resolve(result.translatedText)
              }
            } catch (e) {
              console.log(`Failed to parse Python output: ${output}`)
              reject(new Error(`Failed to parse Python output: ${output}`))
            }
          } else {
            console.log(`Python process failed with code ${code}: ${error}`)
            reject(new Error(`Python process failed: ${error}`))
          }
        })
        
        python.on('error', (err) => {
          reject(new Error(`Failed to start Python process: ${err.message}`))
        })
      })

    } catch (error) {
      console.error('Translation error:', error)
      throw new Error(`Translation failed: ${error.message}`)
    }
  }

  /**
   * 批量翻译
   */
  async translateBatch(texts, sourceLanguage, targetLanguage) {
    if (!this.modelLoaded) {
      throw new Error('Model not loaded')
    }

    try {
      console.log(`Batch translating ${texts.length} texts: ${sourceLanguage} -> ${targetLanguage}`)

      const results = []
      
      // 分批处理以避免过载
      for (let i = 0; i < texts.length; i += this.batchSize) {
        const batch = texts.slice(i, i + this.batchSize)
        
        const batchResults = await Promise.all(
          batch.map(async (text) => {
            try {
              const translatedText = await this.translateText(text, sourceLanguage, targetLanguage)
              return {
                translatedText,
                sourceLanguage,
                targetLanguage,
                success: true
              }
            } catch (error) {
              console.error(`Failed to translate text: "${text.substring(0, 50)}..."`, error)
              return {
                translatedText: text, // 失败时返回原文
                sourceLanguage,
                targetLanguage,
                success: false,
                error: error.message
              }
            }
          })
        )
        
        results.push(...batchResults)
      }

      return results

    } catch (error) {
      console.error('Batch translation error:', error)
      throw new Error(`Batch translation failed: ${error.message}`)
    }
  }

  /**
   * 检查模型是否已加载
   */
  isModelLoaded() {
    return this.modelLoaded && fs.existsSync(this.modelPath)
  }

  /**
   * 获取支持的语言
   */
  getSupportedLanguages() {
    return this.languageMap
  }

  /**
   * 检查语言是否支持
   */
  isLanguageSupported(language) {
    return language in this.languageMap
  }

  async translate(text, sourceLang, targetLang) {
    console.log('=== NLLB SERVICE TRANSLATE ===')
    console.log('Input text length:', text.length)
    console.log('Input text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
    console.log('Source language:', sourceLang)
    console.log('Target language:', targetLang)
    
    return new Promise((resolve, reject) => {
      // 创建Python脚本内容
      const pythonScript = `#!/usr/bin/env python3
import sys
import json
import os
from pathlib import Path

# 添加模型路径
model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

class NLLBTranslator:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_model(self):
        if self.model is None:
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
                self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
                self.model.to(self.device)
                return True
            except Exception as e:
                print(json.dumps({"error": f"Failed to load model: {e}"}))
                return False
        return True
    
    def translate(self, text, src_lang, tgt_lang):
        if not self.load_model():
            return None
            
        try:
            # 设置源语言 - 这是NLLB正确翻译的关键
            self.tokenizer.src_lang = src_lang
            
            # 编码输入文本 - 增加长度限制
            inputs = self.tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 获取目标语言的token ID
            tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
            
            # 生成翻译 - 强制完整翻译参数
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_new_tokens=512,  # 使用max_new_tokens而不是max_length
                    min_length=20,  # 增加最小长度
                    num_beams=4,
                    length_penalty=0.0,  # 完全移除长度惩罚
                    early_stopping=False,  # 禁用早停
                    no_repeat_ngram_size=3,  # 避免重复
                    do_sample=False,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    forced_eos_token_id=None  # 不强制结束
                )
            
            # 解码结果
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return result
            
        except Exception as e:
            print(json.dumps({"error": f"Translation failed: {e}"}))
            return None

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python translate.py <text> <src_lang> <tgt_lang>"}))
        sys.exit(1)
    
    text = sys.argv[1]
    src_lang = sys.argv[2]  
    tgt_lang = sys.argv[3]
    
    translator = NLLBTranslator()
    result = translator.translate(text, src_lang, tgt_lang)
    
    if result:
        print(json.dumps({"translatedText": result}))
    else:
        print(json.dumps({"error": "Translation failed"}))

if __name__ == "__main__":
    main()
`

      // 创建临时Python文件
      const tempFile = path.join(__dirname, `temp_translate_${Date.now()}.py`)
      fs.writeFileSync(tempFile, pythonScript)

      console.log('=== PYTHON SCRIPT EXECUTION ===')
      console.log('Temp script path:', tempFile)
      console.log('Executing command: python', [tempFile, text, sourceLang, targetLang])

      // 执行Python脚本
      const pythonProcess = spawn('python', [tempFile, text, sourceLang, targetLang], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        const chunk = data.toString()
        stdout += chunk
        console.log('Python stdout chunk:', chunk)
      })

      pythonProcess.stderr.on('data', (data) => {
        const chunk = data.toString()
        stderr += chunk
        console.log('Python stderr chunk:', chunk)
      })

      pythonProcess.on('close', (code) => {
        console.log('=== PYTHON SCRIPT COMPLETED ===')
        console.log('Exit code:', code)
        console.log('Full stdout:', stdout)
        console.log('Full stderr:', stderr)
        
        // 清理临时文件
        try {
          fs.unlinkSync(tempFile)
          console.log('Temp file cleaned up')
        } catch (err) {
          console.warn('Failed to clean up temp file:', err.message)
        }

        if (code !== 0) {
          console.error('Python script failed with code:', code)
          reject(new Error(`Translation failed: ${stderr || 'Unknown error'}`))
          return
        }

        try {
          const result = JSON.parse(stdout.trim())
          console.log('=== PARSED PYTHON RESULT ===')
          console.log('Parsed result:', JSON.stringify(result, null, 2))
          
          if (result.error) {
            console.error('Python script returned error:', result.error)
            reject(new Error(result.error))
          } else if (result.translatedText) {
            console.log('Translation successful')
            console.log('Translated text length:', result.translatedText.length)
            console.log('Translated text preview:', result.translatedText.substring(0, 150) + (result.translatedText.length > 150 ? '...' : ''))
            resolve(result.translatedText)
          } else {
            console.error('Unexpected result format:', result)
            reject(new Error('Invalid response format from translation script'))
          }
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError)
          console.error('Raw stdout:', stdout)
          reject(new Error(`Failed to parse translation result: ${parseError.message}`))
        }
      })

      pythonProcess.on('error', (error) => {
        console.error('=== PYTHON PROCESS ERROR ===')
        console.error('Error spawning Python process:', error)
        
        // 清理临时文件
        try {
          fs.unlinkSync(tempFile)
        } catch (err) {
          console.warn('Failed to clean up temp file after error:', err.message)
        }
        
        reject(new Error(`Failed to execute translation: ${error.message}`))
      })
    })
  }

  // 翻译统计信息方法
  getTranslationStats(text, sourceLanguage, targetLanguage) {
    const charCount = text.length
    const wordCount = text.trim().split(/\s+/).length
    const estimatedCredits = Math.ceil(charCount * 0.1) // 0.1积分/字符
    
    return {
      characterCount: charCount,
      wordCount: wordCount,
      estimatedCredits: estimatedCredits,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      supportedPair: this.isLanguagePairSupported(sourceLanguage, targetLanguage)
    }
  }

  isLanguagePairSupported(sourceLanguage, targetLanguage) {
    return this.languageMap[sourceLanguage] && this.languageMap[targetLanguage]
  }
}

module.exports = new NLLBTranslationService() 