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
            
            # 编码输入文本
            inputs = self.tokenizer(text, return_tensors="pt", max_length=512, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 获取目标语言的token ID
            tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
            
            # 生成翻译
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_length=512,
                    num_beams=4,
                    length_penalty=1.0,
                    early_stopping=True
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

      console.log(`Translating: ${sourceLanguage} (${sourceCode}) -> ${targetLanguage} (${targetCode})`)

      return new Promise((resolve, reject) => {
        const python = spawn('python', [this.pythonScript, text, sourceCode, targetCode])
        
        let output = ''
        let error = ''
        
        python.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        python.stderr.on('data', (data) => {
          error += data.toString()
        })
        
        python.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output.trim())
              if (result.error) {
                reject(new Error(result.error))
              } else {
                resolve(result.translatedText)
              }
            } catch (e) {
              reject(new Error(`Failed to parse Python output: ${output}`))
            }
          } else {
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
}

module.exports = new NLLBTranslationService() 