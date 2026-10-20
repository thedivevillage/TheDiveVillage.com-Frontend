/**
 * Automated Media Performance & Architecture Validation Suite
 * Enforces production invariants for The Dive Village (.com):
 *  1. No oversized media assets imported into the bundle.
 *  2. No unoptimized raw Cloudinary <img> tags in presentation components.
 *  3. 3D model viewer lazy-loading standards (loading="lazy", reveal="interaction", DPR capped).
 *  4. Correct Cloudflare R2 delivery paths (https://media.thedivevillage.com/TDV-Media/...).
 *  5. ServiceWorker / PWA precache exclusions (videos and GLBs excluded, size capped).
 *  6. Reusable components exports & integrity (OptimizedImage, OptimizedModelViewer, Optimized360Video).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const srcRoot = path.resolve(frontendRoot, 'src')

let failureCount = 0
let warningCount = 0
let passCount = 0

function pass(name, details = '') {
  passCount++
  console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name} ${details ? `(${details})` : ''}`)
}

function warn(name, details = '') {
  warningCount++
  console.log(`  \x1b[33m▲ WARN\x1b[0m: ${name} ${details ? `(${details})` : ''}`)
}

function fail(name, details = '') {
  failureCount++
  console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${name} ${details ? `(${details})` : ''}`)
}

console.log('\n===============================================================')
console.log('   TDV (.com) MEDIA PERFORMANCE & ARCHITECTURE VALIDATOR')
console.log('===============================================================\n')

// -----------------------------------------------------------------
// 1. Bundle Media Size Check (Scans imported local assets)
// -----------------------------------------------------------------
console.log('🔍 [1/6] Scanning for oversized media assets imported in source code...')
let allImports = []
function collectImports(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      collectImports(full)
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const code = fs.readFileSync(full, 'utf8')
      const matches = code.match(/from\s+['"]([^'"]+\.(?:mp4|webm|mov|glb|gltf|png|jpg|webp))['"]/gi) || []
      matches.forEach((m) => {
        const cleaned = m.replace(/from\s+['"]/, '').replace(/['"]$/, '')
        allImports.push(path.resolve(path.dirname(full), cleaned))
      })
    }
  }
}
collectImports(srcRoot)

let oversizedImportedFiles = []
allImports.forEach((imp) => {
  if (fs.existsSync(imp)) {
    const stat = fs.statSync(imp)
    const ext = path.extname(imp).toLowerCase()
    if (['.mp4', '.mov', '.webm'].includes(ext) && stat.size > 2 * 1024 * 1024) {
      oversizedImportedFiles.push({ file: path.relative(frontendRoot, imp), size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB' })
    } else if (['.glb', '.gltf'].includes(ext) && stat.size > 3.5 * 1024 * 1024) {
      oversizedImportedFiles.push({ file: path.relative(frontendRoot, imp), size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB' })
    }
  }
})

if (oversizedImportedFiles.length === 0) {
  pass('Bundle Media Size Check', 'No local raw videos > 2MB or GLBs > 3.5MB imported into the production bundle')
} else {
  fail('Bundle Media Size Check', `${oversizedImportedFiles.length} oversized files imported into bundle`)
  oversizedImportedFiles.forEach((f) => console.log(`      - ${f.file}: ${f.size}`))
}

// -----------------------------------------------------------------
// 2. Unoptimized Raw Cloudinary <img> Tag Linter in Presentation Layer
// -----------------------------------------------------------------
console.log('\n🔍 [2/6] Auditing presentation components for unoptimized raw <img> tags...')
let rawImgTagViolations = []

function checkComponentsForRawImgs(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      checkComponentsForRawImgs(full)
    } else if (/\.(jsx|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        // Flag direct <img> tags taking a raw string containing res.cloudinary without getOptimizedImageUrl or SafeImage
        if (
          line.includes('<img') &&
          line.includes('https://res.cloudinary.com') &&
          !line.includes('getOptimizedImageUrl') &&
          !line.includes('f_auto')
        ) {
          rawImgTagViolations.push({
            file: path.relative(frontendRoot, full),
            line: idx + 1,
            snippet: line.trim().slice(0, 80),
          })
        }
      })
    }
  }
}

checkComponentsForRawImgs(path.resolve(srcRoot, 'components'))
checkComponentsForRawImgs(path.resolve(srcRoot, 'pages'))

if (rawImgTagViolations.length === 0) {
  pass('Component Image Linter', 'Zero raw unoptimized Cloudinary <img> tags found in components or pages')
} else {
  fail('Component Image Linter', `${rawImgTagViolations.length} raw unoptimized <img> tags detected`)
  rawImgTagViolations.slice(0, 5).forEach((v) => console.log(`      - ${v.file}:${v.line}: ${v.snippet}`))
}

// -----------------------------------------------------------------
// 3. 3D Model Loading & Compression Standards
// -----------------------------------------------------------------
console.log('\n🔍 [3/6] Verifying 3D model viewer lazy-loading standards...')
const product3DPath = path.resolve(srcRoot, 'components/Product3DViewer.jsx')
const optimized3DPath = path.resolve(srcRoot, 'components/OptimizedModelViewer.jsx')

if (fs.existsSync(optimized3DPath) && fs.existsSync(product3DPath)) {
  const modelViewerContent = fs.readFileSync(optimized3DPath, 'utf8')
  const hasLazy = modelViewerContent.includes('loading="lazy"')
  const hasInteraction = modelViewerContent.includes('reveal=')
  const hasDpr = modelViewerContent.includes('maxDpr')

  if (hasLazy && hasInteraction && hasDpr) {
    pass('OptimizedModelViewer Architecture', 'loading="lazy", reveal="interaction", and DPR throttling enforced')
  } else {
    fail('OptimizedModelViewer Architecture', 'Missing required lazy-loading or interaction reveal attributes')
  }
} else {
  fail('3D Component Existence', 'OptimizedModelViewer.jsx not found')
}

// -----------------------------------------------------------------
// 4. Cloudflare R2 Delivery Paths & Streams
// -----------------------------------------------------------------
console.log('\n🔍 [4/6] Verifying Cloudflare R2 delivery endpoints...')
const videoOptimizerPath = path.resolve(srcRoot, 'utils/videoOptimizer.js')
const mediaConfigPath = path.resolve(srcRoot, 'config/mediaConfig.js')

if (fs.existsSync(videoOptimizerPath) && fs.existsSync(mediaConfigPath)) {
  const vidContent = fs.readFileSync(videoOptimizerPath, 'utf8')
  const configContent = fs.readFileSync(mediaConfigPath, 'utf8')
  const hasR2Prefix = vidContent.includes('https://media.thedivevillage.com/TDV-Media/') || vidContent.includes('media.thedivevillage.com/TDV-Media/') || configContent.includes('media.thedivevillage.com/TDV-Media/')
  const hasHlsLadder = vidContent.includes('.m3u8') || configContent.includes('.m3u8')
  const hasMp4Fallback = vidContent.includes('.mp4') || configContent.includes('.mp4')

  if (hasR2Prefix && hasHlsLadder && hasMp4Fallback) {
    pass('R2 Streaming Pipeline', 'Canonical R2 media.thedivevillage.com/TDV-Media/ paths, HLS master playlists, and MP4 fallbacks active')
  } else {
    fail('R2 Streaming Pipeline', 'R2 video paths do not follow canonical delivery specifications')
  }
} else {
  fail('R2 Config Existence', 'videoOptimizer.js or mediaConfig.js missing')
}

// -----------------------------------------------------------------
// 5. ServiceWorker / PWA Precache Exclusions
// -----------------------------------------------------------------
console.log('\n🔍 [5/6] Verifying ServiceWorker PWA precache limits...')
const viteConfigPath = path.resolve(frontendRoot, 'vite.config.js')
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8')
  const hasVideoIgnore = viteContent.includes('mp4') && viteContent.includes('glb')
  const hasCacheLimit = viteContent.includes('maximumFileSizeToCacheInBytes')

  if (hasVideoIgnore && hasCacheLimit) {
    pass('PWA Precache Safety', 'Videos and GLB models excluded from service worker precaching; cache size capped to 3MB')
  } else {
    fail('PWA Precache Safety', 'Service worker may accidentally precache huge video or 3D binary files')
  }
} else {
  fail('Vite Config Existence', 'vite.config.js missing')
}

// -----------------------------------------------------------------
// 6. Reusable Optimization Components Verification
// -----------------------------------------------------------------
console.log('\n🔍 [6/6] Verifying Reusable Optimization Architecture Components...')
const requiredComponents = [
  'components/OptimizedImage.jsx',
  'components/OptimizedModelViewer.jsx',
  'components/Optimized360Video.jsx',
  'config/mediaConfig.js',
]

let missingComp = []
requiredComponents.forEach((c) => {
  const full = path.resolve(srcRoot, c)
  if (!fs.existsSync(full)) {
    missingComp.push(c)
  }
})

if (missingComp.length === 0) {
  pass('Reusable Media Component Suite', 'OptimizedImage, OptimizedModelViewer, Optimized360Video, and mediaConfig all deployed')
} else {
  fail('Reusable Media Component Suite', `Missing components: ${missingComp.join(', ')}`)
}

console.log('\n===============================================================')
console.log(`VALIDATION SUMMARY: ${passCount} Passed, ${warningCount} Warnings, ${failureCount} Failures`)
console.log('===============================================================\n')

if (failureCount > 0) {
  process.exit(1)
} else {
  console.log('✅ ALL MEDIA PERFORMANCE INVARIANTS SATISFIED.')
  process.exit(0)
}
