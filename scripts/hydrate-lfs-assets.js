import fs from 'fs'
import path from 'path'
import https from 'https'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoOwner = 'The-Dive-Village'
const repoName = 'TheDiveVillage-Frontend'
const assetsDir = path.resolve(__dirname, '../Frontend/src/assets')

function getFilesRecursively(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
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

function parseLfsPointer(content) {
  const lines = content.split(/\r?\n/)
  let oid = null
  let size = null

  for (const line of lines) {
    if (line.startsWith('oid sha256:')) {
      oid = line.replace('oid sha256:', '').trim()
    } else if (line.startsWith('size ')) {
      size = parseInt(line.replace('size ', '').trim(), 10)
    }
  }

  if (oid && size) {
    return { oid, size }
  }
  return null
}

function fetchLfsDownloadUrl(oid, size) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      operation: 'download',
      transfers: ['basic'],
      objects: [{ oid, size }]
    })

    const req = https.request(`https://github.com/${repoOwner}/${repoName}.git/info/lfs/objects/batch`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Node-LFS-Hydrator'
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data)
            const downloadUrl = json.objects?.[0]?.actions?.download?.href
            if (downloadUrl) {
              resolve(downloadUrl)
            } else {
              reject(new Error(`No download action returned for OID ${oid}`))
            }
          } catch (e) {
            reject(e)
          }
        } else {
          reject(new Error(`LFS Batch API HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`))
      }

      const fileStream = fs.createWriteStream(destPath)
      res.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => reject(err))
      })
    }).on('error', reject)
  })
}

function calculateSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('data', data => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function main() {
  console.log('💧 [LFS Hydrator] Starting build-time Git LFS asset hydration...')

  if (!fs.existsSync(assetsDir)) {
    console.error(`❌ [LFS Hydrator Error] Assets directory not found: ${assetsDir}`)
    process.exit(1)
  }

  const files = getFilesRecursively(assetsDir)
  let pointersFound = 0
  let hydratedCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase()
    if (!['.mp4', '.mov', '.webm', '.png', '.jpg', '.jpeg', '.glb', '.txt'].includes(ext)) continue

    const relPath = path.relative(assetsDir, filePath)
    const stats = fs.statSync(filePath)

    if (stats.size > 1024) {
      skippedCount++
      continue
    }

    const content = fs.readFileSync(filePath, 'utf8')
    if (!content.includes('version https://git-lfs.github.com/spec/v1')) {
      skippedCount++
      continue
    }

    const pointer = parseLfsPointer(content)
    if (!pointer) {
      skippedCount++
      continue
    }

    pointersFound++
    console.log(`⬇️ [LFS Hydrating] ${relPath} (Target size: ${(pointer.size / (1024 * 1024)).toFixed(2)} MB)...`)

    try {
      const downloadUrl = await fetchLfsDownloadUrl(pointer.oid, pointer.size)
      const tempPath = `${filePath}.lfs_tmp`
      await downloadFile(downloadUrl, tempPath)

      const tempStats = fs.statSync(tempPath)
      if (tempStats.size !== pointer.size) {
        throw new Error(`Size mismatch: expected ${pointer.size} bytes, got ${tempStats.size} bytes`)
      }

      const calculatedHash = await calculateSha256(tempPath)
      if (calculatedHash.toLowerCase() !== pointer.oid.toLowerCase()) {
        throw new Error(`SHA-256 hash mismatch: expected ${pointer.oid}, got ${calculatedHash}`)
      }

      fs.renameSync(tempPath, filePath)
      const finalStats = fs.statSync(filePath)
      console.log(`✅ [LFS Hydrated & Verified] ${relPath} (${(finalStats.size / (1024 * 1024)).toFixed(2)} MB) SHA-256 OK`)
      hydratedCount++
    } catch (err) {
      console.error(`❌ [LFS Hydrate Error] Failed to hydrate ${relPath}: ${err.message}`)
      failedCount++
      const tempPath = `${filePath}.lfs_tmp`
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
    }
  }

  console.log(`\n📊 [LFS Hydration Summary]`)
  console.log(`   - Pointer files discovered: ${pointersFound}`)
  console.log(`   - Already hydrated / binary: ${skippedCount}`)
  console.log(`   - Successfully hydrated: ${hydratedCount}`)
  console.log(`   - Failed: ${failedCount}`)

  if (failedCount > 0) {
    console.error('❌ [LFS Hydration Failure] One or more Git LFS assets failed to hydrate.')
    process.exit(1)
  }

  console.log('🚀 [LFS Hydrator] Build-time asset hydration complete!')
}

main().catch(err => {
  console.error('❌ [LFS Hydrator Fatal Error]', err)
  process.exit(1)
})
