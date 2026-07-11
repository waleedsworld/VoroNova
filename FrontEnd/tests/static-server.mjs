// Minimal zero-dependency static file server for the Next.js static export
// (the `dist/` folder produced by `next build` with output: 'export').
//
// It mirrors the routing that a static host / CDN performs for a
// trailingSlash export: a request for "/app/" is served from
// "dist/app/index.html". Used by the Playwright e2e suite so the tests run
// against the real production build with no extra runtime dependency.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 8189

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function resolveFile(urlPath) {
  // Strip query string and decode, then prevent path traversal.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const candidates = []
  const direct = join(ROOT, clean)
  candidates.push(direct)
  // Directory-style route -> index.html inside it.
  candidates.push(join(direct, 'index.html'))
  // trailingSlash export writes /route/index.html even without a trailing slash.
  if (!clean.endsWith('/')) candidates.push(join(ROOT, clean + '/index.html'))

  for (const candidate of candidates) {
    try {
      const s = await stat(candidate)
      if (s.isFile()) return candidate
    } catch {
      /* try next candidate */
    }
  }
  return null
}

const server = http.createServer(async (req, res) => {
  try {
    let file = await resolveFile(req.url || '/')
    let status = 200
    if (!file) {
      status = 404
      file = join(ROOT, '404.html')
    }
    const body = await readFile(file)
    res.writeHead(status, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal server error: ' + err.message)
  }
})

server.listen(PORT, () => {
  console.log(`[static-server] serving ${ROOT} at http://localhost:${PORT}`)
})
