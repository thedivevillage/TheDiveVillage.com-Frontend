import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcDir = path.resolve(__dirname, '../Frontend/dist')
const destDir = path.resolve(__dirname, '../dist')

try {
  if (fs.existsSync(srcDir)) {
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true })
    }
    fs.cpSync(srcDir, destDir, { recursive: true, force: true })
    console.log(`📦 [Sync Dist] Successfully mirrored build output from ${srcDir} to ${destDir}`)
  } else {
    console.warn(`⚠️ [Sync Dist] Source directory not found: ${srcDir}`)
  }
} catch (err) {
  console.error(`❌ [Sync Dist] Failed to mirror build output:`, err)
}
