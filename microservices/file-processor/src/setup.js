const fs = require('fs-extra')
const path = require('path')

/**
 * 确保所有必要的目录存在
 */
async function ensureDirectories() {
  const baseDir = path.join(__dirname, '..')
  const directories = [
    path.join(baseDir, 'uploads'),
    path.join(baseDir, 'temp'),
    path.join(baseDir, 'results')
  ]

  for (const dir of directories) {
    try {
      await fs.ensureDir(dir)
      console.log(`✓ Directory ensured: ${path.relative(process.cwd(), dir)}`)
    } catch (error) {
      console.error(`✗ Failed to create directory ${dir}:`, error.message)
    }
  }
}

module.exports = { ensureDirectories } 