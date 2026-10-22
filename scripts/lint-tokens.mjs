import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const roots = ['src']
const files = []

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await collect(filePath)
    } else if (entry.isFile() && /\.(vue|ts|css)$/.test(filePath)) {
      if (filePath === path.join('src', 'styles', 'tokens', 'primitives.css')) continue
      files.push(filePath)
    }
  }
}

for (const root of roots) await collect(root)

const rawColorPattern = /#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/gi
const paletteClassPattern = /(?:^|:)(?:bg|text|border|ring|outline|fill|stroke)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-(?:50|[1-9]00))?(?:\/\d{1,3})?(?=$|[\s"'`])/g
const arbitraryClassPattern = /\b[\w:-]+-\[[^\]\s]+\]/g

// These values implement the existing 600px mobile breakpoint and shadcn Sidebar layout math.
const allowedLayoutClasses = new Set([
  'min-[601px]',
  'transition-[width]',
  'transition-[width,height,padding]',
  'transition-[left,right,width]',
  'transition-[margin,opacity]',
  'w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
  'w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
  'left-[calc(var(--sidebar-width)*-1)]',
  'right-[calc(var(--sidebar-width)*-1)]',
])
const allowedStructuralVariants = new Set(['has-[>svg]'])

const errors = []

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8')
  const relativePath = path.relative(process.cwd(), filePath)

  for (const match of source.matchAll(rawColorPattern)) {
    errors.push(`${relativePath}: raw color literal "${match[0]}"`)
  }

  for (const match of source.matchAll(paletteClassPattern)) {
    errors.push(`${relativePath}: raw Tailwind palette class "${match[0].trim()}"`)
  }

  for (const match of source.matchAll(arbitraryClassPattern)) {
    const token = match[0]
    // Attribute selector variants such as data-[state=open] are selectors, not design values.
    if (token.includes('data-[')) continue
    if (allowedStructuralVariants.has(token)) continue
    if (!allowedLayoutClasses.has(token)) {
      errors.push(`${relativePath}: arbitrary Tailwind value "${token}"`)
    }
  }
}

if (errors.length) {
  console.error('Design token guard failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Design token guard passed (${files.length} source files checked).`)
}
