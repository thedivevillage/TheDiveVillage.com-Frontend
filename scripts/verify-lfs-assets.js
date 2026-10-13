import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const assetsDir = path.resolve(__dirname, '../Frontend/src/assets')

function getFilesRecursively(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath))
    } else {
      results.push(filePath)
    }
  })
  return results
}

console.log('🔍 [LFS Verification] Recursively verifying ALL video assets in Frontend/src/assets...')

if (!fs.existsSync(assetsDir)) {
  console.error(`❌ [LFS ERROR] Assets directory not found: ${assetsDir}`)
  process.exit(1)
}

const files = getFilesRecursively(assetsDir)
let verifiedCount = 0
let hasErrors = false

for (const filePath of files) {
  const ext = path.extname(filePath).toLowerCase()
  if (!['.mp4', '.mov', '.webm'].includes(ext)) continue

  const relPath = path.relative(assetsDir, filePath)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ [LFS ERROR] Required video asset missing: ${relPath}`)
    hasErrors = true
    continue
  }

  const stats = fs.statSync(filePath)
  if (stats.size <= 500) {
    console.error(`❌ [LFS ERROR] Video asset size too small (${stats.size} bytes): ${relPath}`)
    hasErrors = true
    continue
  }

  const fd = fs.openSync(filePath, 'r')
  const buffer = Buffer.alloc(512)
  const bytesRead = fs.readSync(fd, buffer, 0, 512, 0)
  fs.closeSync(fd)

  const headerAscii = buffer.toString('utf8', 0, bytesRead)
  if (headerAscii.includes('version https://git-lfs.github.com/spec/v1')) {
    console.error(`❌ [LFS ERROR] Video asset is a Git LFS pointer text file! (${stats.size} bytes): ${relPath}`)
    hasErrors = true
    continue
  }

  if (ext === '.mp4' || ext === '.mov') {
    const isFtyp = buffer.includes(Buffer.from('ftyp'))
    if (!isFtyp) {
      console.error(`❌ [LFS ERROR] Video asset does not contain a valid MP4/MOV header ('ftyp'): ${relPath}`)
      hasErrors = true
      continue
    }
  }

  verifiedCount++
}

if (hasErrors) {
  console.error('❌ [LFS BUILD FAILURE] One or more video assets are missing, empty, or unhydrated Git LFS pointers.')
  console.error('❌ Failing build to prevent publishing a broken bundle.')
  process.exit(1)
}

console.log(`🚀 [LFS SUCCESS] All ${verifiedCount} discovered video assets verified as valid binary files!`)
