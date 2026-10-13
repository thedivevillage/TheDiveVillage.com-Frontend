import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../src')
const assetsDir = path.resolve(srcDir, 'assets')

// 1. Build map of all assets
const assetMap = new Map()

function scanAssets(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scanAssets(fullPath)
    } else {
      assetMap.set(entry.name.toLowerCase(), fullPath)
    }
  }
}

scanAssets(assetsDir)
console.log(`Found ${assetMap.size} files in assets.`)

// 2. Scan and update all .js and .jsx files
function processFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      processFiles(fullPath)
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8')
      let modified = false
      
      // Match strings that look like relative paths to assets
      // e.g. '../assets/Gallery/Photo.jpg' or '../../assets/Media/video.mp4'
      const regex = /(['"])((\.\.\/|\.\/)+assets\/[^'"]+)\1/g
      
      content = content.replace(regex, (match, quote, p1) => {
        const importPath = p1
        const absoluteTarget = path.resolve(path.dirname(fullPath), importPath)
        
        if (!fs.existsSync(absoluteTarget)) {
          const cleanImportPath = importPath.split('?')[0]
          const basename = path.basename(cleanImportPath).toLowerCase()
          if (assetMap.has(basename)) {
            const actualTarget = assetMap.get(basename)
            // Compute new relative path
            let newRelative = path.relative(path.dirname(fullPath), actualTarget)
            // Normalize path separators to POSIX for imports
            newRelative = newRelative.split(path.sep).join('/')
            if (!newRelative.startsWith('.')) {
              newRelative = './' + newRelative
            }
            
            // Re-append the query string if it was there
            const query = importPath.includes('?') ? importPath.slice(importPath.indexOf('?')) : ''
            newRelative = newRelative + query
            
            console.log(`Updated in ${path.relative(srcDir, fullPath)}:\n  ${importPath}\n  -> ${newRelative}`)
            modified = true
            return `${quote}${newRelative}${quote}`
          } else {
            console.warn(`WARNING: Broken import ${importPath} in ${path.relative(srcDir, fullPath)} - File not found anywhere in assets!`)
          }
        }
        return match
      })
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8')
      }
    }
  }
}

processFiles(srcDir)
console.log('Done fixing imports.')
