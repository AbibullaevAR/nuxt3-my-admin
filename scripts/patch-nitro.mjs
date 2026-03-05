/**
 * Nitro 2.12+ static asset path bug fix.
 *
 * Problem: readAsset() in .output/server/chunks/_/nitro.mjs resolves
 * "../public/..." relative to chunks/_/ (import.meta.url of that chunk),
 * instead of the server root — causing 500 errors for all /_nuxt/* assets.
 *
 * Fix: copy .output/public into .output/server/chunks/public so that
 * the relative path "../public/..." resolves correctly from chunks/_/.
 */

import { cpSync, existsSync } from 'fs'
import { resolve } from 'path'

const src = resolve('.output/public')
const dest = resolve('.output/server/chunks/public')

if (!existsSync(src)) {
  console.error('❌ Patch failed: .output/public not found. Run "npm run build" first.')
  process.exit(1)
}

cpSync(src, dest, { recursive: true })
console.log('✅ Nitro patch applied: .output/public copied to .output/server/chunks/public')
