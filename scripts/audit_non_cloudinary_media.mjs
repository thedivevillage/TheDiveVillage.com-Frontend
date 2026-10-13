import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcDir = path.resolve(__dirname, '../Frontend/src')
const assetsDir = path.join(srcDir, 'assets')

function getFiles(dir, extRegex) {
  let results = []
  if (!fs.existsSync(dir)) return results
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      results = results.concat(getFiles(full, extRegex))
    } else if (!extRegex || extRegex.test(item.name)) {
      results.push(full)
    }
  }
  return results
}

const codeFiles = getFiles(srcDir, /\.(js|jsx|ts|tsx)$/)

const videoImports = []
const imageImports = []
const audioImports = []

codeFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8')
  const relFile = path.relative(srcDir, filePath).replace(/\\/g, '/')

  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    if (line.includes('assets/')) {
      const match = line.match(/(?:import\s+([\w$]+)\s+from\s+['"]([^'"]+)['"]|const\s+([\w$]+)\s*=\s*['"]([^'"]+)['"])/)
      if (match) {
        const varName = match[1] || match[3]
        const importPath = match[2] || match[4]
        const ext = path.extname(importPath).toLowerCase()

        // Check if there is a Cloudinary URL assigned to this component or variable
        const hasCloudinaryUrl = content.includes('https://res.cloudinary.com')
        const regexTwin = new RegExp(`const\\s+${varName}\\s*=\\s*['"]https:\\/\\/res\\.cloudinary\\.com`, 'i')
        const hasDirectTwin = regexTwin.test(content)

        const item = {
          varName,
          importPath,
          file: relFile,
          hasDirectCloudinaryTwin: hasDirectTwin
        }

        if (['.mp4', '.mov', '.webm'].includes(ext)) {
          videoImports.push(item)
        } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && !importPath.includes('logo') && !importPath.includes('icon') && !importPath.includes('svg')) {
          imageImports.push(item)
        } else if (ext === '.mp3') {
          audioImports.push(item)
        }
      }
    }
  })
})

console.log('=== VIDEO ASSETS IMPORTED FROM LOCAL FILES ===')
videoImports.forEach((v, i) => {
  console.log(`${i+1}. Variable: [${v.varName}] | File: [${v.importPath}] | Used in: [${v.file}] | Cloudinary Twin: ${v.hasDirectCloudinaryTwin ? 'YES (Fallback)' : 'NO (Direct Local)'}`)
})

console.log('\n=== AUDIO ASSETS IMPORTED FROM LOCAL FILES ===')
audioImports.forEach((a, i) => {
  console.log(`${i+1}. Variable: [${a.varName}] | File: [${a.importPath}] | Used in: [${a.file}]`)
})

console.log('\n=== DIRECT LOCAL VIDEO FILES SUMMARY ===')
const directLocalVideos = videoImports.filter(v => !v.hasDirectCloudinaryTwin)
directLocalVideos.forEach((v, i) => {
  console.log(`${i+1}. ${v.importPath} (used in ${v.file})`)
})
