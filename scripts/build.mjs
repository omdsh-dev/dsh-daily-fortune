import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const stagingRoot = resolve(root, '.build')
const stagingLib = resolve(stagingRoot, 'lib')
const backupLib = resolve(stagingRoot, 'lib.previous')
const currentLib = resolve(root, 'lib')

rmSync(stagingRoot, { recursive: true, force: true })
mkdirSync(stagingRoot, { recursive: true })

try {
  run('node', [
    'node_modules/typescript/bin/tsc',
    '-p', 'tsconfig.json',
    '--outDir', stagingLib,
    '--declarationDir', resolve(stagingLib, 'types'),
  ])
  run('node', ['node_modules/tsdown/dist/run.mjs', '--config', 'tsdown.config.ts', '--out-dir', stagingLib])
  sanitizeGeneratedPaths(stagingLib)
  promote(stagingLib, currentLib, backupLib)
} finally {
  rmSync(stagingRoot, { recursive: true, force: true })
}

function promote(source, destination, backup) {
  if (!existsSync(destination)) {
    renameSync(source, destination)
    return
  }
  if (process.platform === 'linux') {
    const exchange = spawnSync('mv', ['--exchange', '-T', source, destination], { stdio: 'ignore', cwd: root })
    if (exchange.status === 0) return
  }
  try {
    renameSync(destination, backup)
    renameSync(source, destination)
    rmSync(backup, { recursive: true, force: true })
  } catch (error) {
    if (!existsSync(destination) && existsSync(backup)) renameSync(backup, destination)
    throw error
  }
}

function sanitizeGeneratedPaths(directory) {
  for (const filename of ['client.js', 'client.js.map']) {
    const path = resolve(directory, filename)
    if (!existsSync(path)) continue
    const original = readFileSync(path, 'utf8')
    const sanitized = original
      .replaceAll(`${root}/`, '')
      .replaceAll(`${root.replaceAll('\\', '/')}/`, '')
    writeFileSync(path, sanitized)
    if (sanitized.includes(root) || sanitized.includes(root.replaceAll('\\', '/'))) {
      throw new Error(`${filename} still contains the build root`)
    }
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: root })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with status ${result.status ?? 'signal'}`)
}
