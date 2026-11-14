// Copies the 180 px exercise media from a local openGym clone into catalogue/media/ (the layout the
// build scripts expect). Run it yourself, from the repo root:
//   node scripts/bodyworks/copy-media.mjs ../openGym
// The media belongs to Gym visual (gymvisual.com). Keep it unmodified and keep NOTICE.md with it.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
const src = process.argv[2]
if (!src) { console.error('Usage: node scripts/bodyworks/copy-media.mjs <path-to-openGym-clone>'); process.exit(1) }
const from = resolve(src, 'catalogue', 'media')
if (!existsSync(join(from, 'still')) || !existsSync(join(from, 'clip'))) { console.error('No catalogue/media/still and clip in ' + from); process.exit(1) }
const to = resolve('catalogue', 'media')
mkdirSync(to, { recursive: true })
for (const d of ['still', 'clip']) cpSync(join(from, d), join(to, d), { recursive: true })
console.log('Copied the exercise media to ' + to)
