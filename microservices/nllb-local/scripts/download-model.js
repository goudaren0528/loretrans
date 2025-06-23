const fs = require('fs')
const path = require('path')
const https = require('https')
const { pipeline } = require('@huggingface/transformers')

class ModelDownloader {
  constructor() {
    this.modelName = 'facebook/nllb-200-distilled-600M'
    this.modelDir = path.join(__dirname, '../models/nllb-600m')
    this.downloadDir = path.join(__dirname, '../downloads')
  }

  /**
   * 确保目录存在
   */
  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  }

  /**
   * 下载模型文件
   */
  async downloadModel() {
    console.log('Starting NLLB 600M model download...')
    console.log(`Model: ${this.modelName}`)
    console.log(`Target directory: ${this.modelDir}`)

    try {
      this.ensureDirectory(this.modelDir)
      this.ensureDirectory(this.downloadDir)

      // 使用transformers.js下载并缓存模型
      console.log('Downloading model from Hugging Face Hub...')
      
      const model = await pipeline('translation', this.modelName, {
        cache_dir: this.downloadDir
      })

      console.log('Model downloaded successfully!')
      console.log(`Model cached in: ${this.downloadDir}`)
      
      // 验证下载
      await this.verifyDownload()
      
      return true

    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  /**
   * 验证下载的模型
   */
  async verifyDownload() {
    console.log('Verifying downloaded model...')
    
    try {
      // 简单的验证：尝试加载模型并进行一次翻译
      const testModel = await pipeline('translation', this.modelName, {
        cache_dir: this.downloadDir
      })

      const testResult = await testModel('Hello world', {
        src_lang: 'eng_Latn',
        tgt_lang: 'fra_Latn'
      })

      console.log('Verification successful!')
      console.log('Test translation:', testResult)
      return true

    } catch (error) {
      console.error('Verification failed:', error)
      throw error
    }
  }

  /**
   * 获取模型信息
   */
  async getModelInfo() {
    const modelSize = await this.getDirectorySize(this.downloadDir)
    
    return {
      modelName: this.modelName,
      downloadDir: this.downloadDir,
      modelDir: this.modelDir,
      sizeGB: (modelSize / (1024 * 1024 * 1024)).toFixed(2),
      downloaded: fs.existsSync(this.downloadDir)
    }
  }

  /**
   * 计算目录大小
   */
  async getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0

    let totalSize = 0
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        totalSize += await this.getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }

    return totalSize
  }

  /**
   * 清理下载文件
   */
  cleanup() {
    if (fs.existsSync(this.downloadDir)) {
      fs.rmSync(this.downloadDir, { recursive: true, force: true })
      console.log('Download cache cleaned up')
    }
  }
}

// 命令行使用
async function main() {
  const downloader = new ModelDownloader()
  
  const command = process.argv[2] || 'download'

  try {
    switch (command) {
      case 'download':
        await downloader.downloadModel()
        break
      
      case 'info':
        const info = await downloader.getModelInfo()
        console.log('Model Information:')
        console.log(`  Name: ${info.modelName}`)
        console.log(`  Download Directory: ${info.downloadDir}`)
        console.log(`  Model Directory: ${info.modelDir}`)
        console.log(`  Size: ${info.sizeGB} GB`)
        console.log(`  Downloaded: ${info.downloaded}`)
        break
      
      case 'cleanup':
        downloader.cleanup()
        break
      
      case 'verify':
        await downloader.verifyDownload()
        break
      
      default:
        console.log('Usage: node download-model.js [download|info|cleanup|verify]')
        break
    }
  } catch (error) {
    console.error('Command failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = ModelDownloader 